import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { createClient } from "redis";
import userRoutes from "./routes/user.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";
import { DEMO_EMAIL, DEMO_OTP } from "./controllers/user.js";

dotenv.config();

connectDb();

connectRabbitMQ();

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

// After redisClient.connect()
redisClient.set(`otp:${DEMO_EMAIL}`, DEMO_OTP).then(() => {
  console.log(`✅ Demo OTP preloaded for ${DEMO_EMAIL}: ${DEMO_OTP}`);
});

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
