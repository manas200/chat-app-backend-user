import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.CLOUDAMQP_URL as string);
    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ (CloudAMQP)");
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ", error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.warn("⚠️ RabbitMQ channel not initialized. Retrying...");
    return false;
  }

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  return true;
};
