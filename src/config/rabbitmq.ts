import amqp from "amqplib";

let channel: amqp.Channel | null = null;
let channelReady: Promise<void>;

export const connectRabbitMQ = async () => {
  channelReady = new Promise(async (resolve, reject) => {
    try {
      const connection = await amqp.connect(
        process.env.CLOUDAMQP_URL as string
      );
      channel = await connection.createChannel();
      console.log("✅ Connected to RabbitMQ (CloudAMQP)");
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
    await channelReady; // wait until channel is ready
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
