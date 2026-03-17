import amqp from "amqplib";
import { redisClient } from "../server.js";
import { sql } from "./db.js";

interface CacheInvalidationMessage {
    action: string;
    keys: string[];
}

export const startCacheConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: Number(process.env.RABBITMQ_PORT),
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        });

        const channel = await connection.createChannel();

        const queueName = "chache-invalidation";

        await channel.assertQueue(queueName, { durable: true });

        console.log("✅ Blog Service cache consumer connected to RabbitMQ");

        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(
                        msg.content.toString()
                    ) as CacheInvalidationMessage;

                    console.log("🔔 Received cache invalidation message:", content);

                    if (content.action === "INVALIDATE_CACHE") {
                        for (const pattern of content.keys) {
                            const keys = await redisClient.keys(pattern);

                            if (keys.length > 0) {
                                await redisClient.del(keys);

                                console.log(` Blog service invalidated ${keys.length} cache entries for pattern: ${pattern}`);
                            }

                            const category = "";

                            const searchKeys = "";

                            const cacheKey = `blogs:${searchKeys}:${category}`;

                            const blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;

                            await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

                            console.log(` Cache rebulit with the key: ${cacheKey}`);
                        }
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.error("❌ Error processing cache invalidation message:", error);
                    channel.nack(msg, false, true); 
                }
            }
        })
    } catch (error) {
        console.error("❌ Blog Service failed to connect to RabbitMQ:", error);
    }
};