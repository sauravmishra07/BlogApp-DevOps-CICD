import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import cors from "cors";
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

startCacheConsumer();

app.use("/api/blog", blogRoutes);

export const redisClient = createClient({
  url: process.env.REDIS_URI as string,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  }, 
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

async function startServer() {
  try {
    await redisClient.connect();
    console.log("✅ Upstash Redis connected");

    await redisClient.set("foo", "bar");

    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to Upstash:", err);
    process.exit(1);
  }
}

startServer();
