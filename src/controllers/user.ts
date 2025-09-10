// controller.ts
import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";

export const DEMO_EMAIL = "dummy@gmail.com";
export const DEMO_OTP = "123456"; // fixed OTP for recruiter/demo login

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  // Special case for demo account
  if (email === DEMO_EMAIL) {
    return res.status(200).json({
      message: `Demo OTP is '${DEMO_OTP}'`,
    });
  }

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  if (rateLimit) {
    return res.status(429).json({
      message: "Too many requests. Please wait before requesting a new OTP",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, { EX: 300 }); // expires in 5 min

  await redisClient.set(rateLimitKey, "true", { EX: 60 }); // rate limit 1 per min

  const message = {
    to: email,
    subject: "Your OTP code",
    body: `Your OTP is ${otp}. It is valid for 5 minutes`,
  };

  await publishToQueue("send-otp", message);

  res.status(200).json({
    message: "OTP sent to your mail",
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredOtp } = req.body;

  if (!email || !enteredOtp) {
    return res.status(400).json({
      message: "Email and OTP Required",
    });
  }

  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);

  if (!storedOtp || storedOtp !== enteredOtp) {
    return res.status(400).json({
      message: "Invalid or expired OTP",
    });
  }

  if (email !== DEMO_EMAIL) {
    await redisClient.del(otpKey);
  }

  let user = await User.findOne({ email });

  if (!user) {
    const name = email.slice(0, 8);

    // Generate random avatar from DiceBear
    const randomSeed = Math.random().toString(36).substring(2, 15);
    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${randomSeed}`;

    user = await User.create({ name, email, profilePic: avatarUrl });
  }

  const token = generateToken(user);

  res.json({
    message: "User Verified",
    user,
    token,
  });
});

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: "Please login" });
    }

    const { profilePic } = req.body;
    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Profile picture URL is required" });
    }

    user.profilePic = profilePic;
    await user.save();

    const token = generateToken(user);

    res.json({
      message: "Profile picture updated",
      user,
      token,
    });
  }
);

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  res.json(user);
});

export const updateName = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404).json({
      message: "Please login",
    });
    return;
  }

  user.name = req.body.name;
  await user.save();

  const token = generateToken(user);

  res.json({
    message: "User Updated",
    user,
    token,
  });
});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const users = await User.find();
  res.json(users);
});

export const getAUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});
