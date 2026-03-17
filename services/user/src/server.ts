import express from "express";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoutes from "./routes/user.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name!,
  api_key: process.env.cloudinary_api_key!,
  api_secret: process.env.cloudinary_api_secret!, 
});

const app = express();
connectDB();

app.use("/api/users", userRoutes);
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`✅ Server is running on port http://localhost:${port}`);
});
