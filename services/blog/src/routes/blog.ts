import express, { Router } from "express";
import { getAllBlogs } from "../controllers/blog.js";

const router = express.Router();

router.get("/blogs", getAllBlogs)

export default router;