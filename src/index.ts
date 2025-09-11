import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";
import { DEMO_EMAIL, DEMO_OTP } from "./controllers/user.js";

dotenv.config();

export let redisClient: any; // ✅ export here

const startServer = async () => {
  await connectDb();
  await connectRabbitMQ(); // ✅ wait for RabbitMQ before handling requests

  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  await redisClient.connect();
  console.log("✅ Connected to Redis");

  await redisClient.set(`otp:${DEMO_EMAIL}`, DEMO_OTP);
  console.log(`✅ Demo OTP preloaded for ${DEMO_EMAIL}: ${DEMO_OTP}`);

  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://the-pulse-chat-app.vercel.app",
      ],
      credentials: true,
    })
  );

  app.use("/api/v1", userRoutes);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 User service running on port ${port}`);
  });
};

startServer().catch((err) => {
  console.error("❌ Failed to start server", err);
});
