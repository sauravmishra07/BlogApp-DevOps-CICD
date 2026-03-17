import ampq from "amqplib";

let channel: ampq.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await ampq.connect({
            protocol: "amqp",
            hostname: process.env.RABBITMQ_HOST,
            port: Number(process.env.RABBITMQ_PORT),
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD,
        });

        channel = await connection.createChannel();
        console.log("✅ Connected to RabbitMQ");
    } catch  (error){
        console.error("❌ Failed to connect to RabbitMQ:", error);
    }
};

export const publishToQueue = async (queueName: string, message: any) => {
    if (!channel) {
        console.error("❌ RabbitMQ channel is not initialized");
        return;
    }

    await channel.assertQueue(queueName, { durable: true});

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};

export const invalidateCacheJob = async (cacheKeys: string[]) => {
    try {
        const message = {
            action: "INVALIDATE_CACHE",
            keys: cacheKeys,
        };

        await publishToQueue("cache-invalidation", message);

        console.log("✅ Cache invalidation job published:", message);
    } catch (error) {
        console.error("❌ Failed to publish cache invalidation job:", error);
    }
};