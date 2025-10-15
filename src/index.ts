import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";
import { DEMO_EMAIL, DEMO_OTP } from "./controllers/user.js";

dotenv.config();

const app = express();
export let redisClient: ReturnType<typeof createClient>; // more accurate typing

const startServer = async () => {
  try {
    // ✅ Connect to MongoDB first
    await connectDb();
    console.log("✅ Connected to MongoDB");

    // ✅ Connect to RabbitMQ and wait until ready
    await connectRabbitMQ();

    // ✅ Connect to Redis
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => console.error("Redis error:", err));
    await redisClient.connect();
    console.log("✅ Connected to Redis");

    // ✅ Preload demo OTP
    await redisClient.set(`otp:${DEMO_EMAIL}`, DEMO_OTP);
    console.log(`✅ Demo OTP preloaded for ${DEMO_EMAIL}: ${DEMO_OTP}`);

    // ✅ Middleware
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

    // ✅ Routes
    app.use("/api/v1", userRoutes);

    // ✅ Start server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 User service running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1); // stop if something fails
  }
};

startServer();
