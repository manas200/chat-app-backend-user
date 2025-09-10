import { createClient } from "redis";

const client = createClient({
  url: "rediss://default:Abw3AAIjcDFlNzk0MDg1OWE3YTk0MzlkOGVmODM3MjY4ZmJlYmQzZXAxMA@trusting-rodent-48183.upstash.io:6379",
});

client
  .connect()
  .then(() => {
    console.log("✅ Redis connected successfully!");
    return client.quit();
  })
  .catch((err) => {
    console.error("❌ Redis connection failed:", err);
  });
