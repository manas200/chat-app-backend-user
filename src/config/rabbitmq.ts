import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

let channel: amqp.Channel | null = null;
let channelReady: Promise<void>;

export const connectRabbitMQ = async () => {
  channelReady = new Promise(async (resolve, reject) => {
    try {
      const amqpUrl = process.env.CLOUDAMQP_URL;
      if (!amqpUrl) {
        throw new Error("CLOUDAMQP_URL not defined");
      }

      const connection = await amqp.connect(amqpUrl);
      channel = await connection.createChannel();
      console.log("✅ Connected to RabbitMQ (CloudAMQP)");

      connection.on("error", (err) =>
        console.error("🐇 RabbitMQ connection error:", err)
      );
      connection.on("close", () =>
        console.warn("🐇 RabbitMQ connection closed")
      );
      resolve();
    } catch (error) {
      console.error("❌ Failed to connect to RabbitMQ", error);
      reject(error);
    }
  });

  return channelReady;
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.warn("⚠️ RabbitMQ channel not ready. Waiting...");
    await channelReady;
  }

  if (!channel) {
    console.error("❌ Channel still not available.");
    return false;
  }

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(`📨 Published message to queue "${queueName}"`);
  return true;
};
