import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: 5672,
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ");

    // Reconnect on close
    connection.on("close", () => {
      console.error("❌ RabbitMQ connection closed, retrying in 5s...");
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ", error);
    setTimeout(connectRabbitMQ, 5000); // retry after 5s
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.error("⚠️ RabbitMQ channel not initialized. Message dropped:", message);
    return;
  }

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`📩 Message published to ${queueName}`, message);
};
