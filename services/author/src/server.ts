import express from "express";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import blogRoutes from "./routes/blog.js";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import { connectRabbitMQ } from "./utils/rabbitmq.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name!,
  api_key: process.env.cloudinary_api_key!,
  api_secret: process.env.cloudinary_api_secret!, 
});
const app = express();
app.use(express.json());
app.use(cors());

connectRabbitMQ();

const port = process.env.PORT;

async function initDB() {
  try {
    await sql`
            CREATE TABLE IF NOT EXISTS blogs(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            blogcontent TEXT NOT NULL,
            image VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `;
    await sql`
            CREATE TABLE IF NOT EXISTS comments(
            id SERIAL PRIMARY KEY,
            comment VARCHAR(255) NOT NULL,
            userid VARCHAR(255) NOT NULL,
            username VARCHAR(100) NOT NULL,
            blogid INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `;
    await sql`
            CREATE TABLE IF NOT EXISTS savedblogs(
            id SERIAL PRIMARY KEY,
            userid VARCHAR(255) NOT NULL,
            blogid INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `;
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

app.use("/api/blog", blogRoutes);

initDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server is running on port http://localhost:${port}`);
  });
});
