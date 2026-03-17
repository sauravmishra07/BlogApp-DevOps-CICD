import { redisClient } from "../server.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";

interface Blog {
  id: number;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  author_id: string;
  created_at: Date;
}

export const getAllBlogs = TryCatch(async (req, res) => {
  const { searchQuery, category } = req.query;

  const cacheKey = `blogs:${searchQuery ?? "all"}:${category ?? "all"}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log("🔥 Serving blogs from Redis cache");
    return res.json(JSON.parse(cached));
  }

  let blogs: Blog[];

  if (searchQuery && category) {
    blogs = (await sql`
      SELECT * FROM blogs
      WHERE title ILIKE ${"%" + searchQuery + "%"}
         OR description ILIKE ${"%" + searchQuery + "%"}
         OR category ILIKE ${"%" + category + "%"}
      ORDER BY created_at DESC
    `) as unknown as Blog[];
  } else if (searchQuery) {
    blogs = (await sql`
      SELECT * FROM blogs
      WHERE title ILIKE ${"%" + searchQuery + "%"}
         OR description ILIKE ${"%" + searchQuery + "%"}
      ORDER BY created_at DESC
    `) as unknown as Blog[];
  } else if (category) {
    blogs = (await sql`
      SELECT * FROM blogs
      WHERE category ILIKE ${"%" + category + "%"}
      ORDER BY created_at DESC
    `) as unknown as Blog[];
  } else {
    blogs = (await sql`
      SELECT * FROM blogs
      ORDER BY created_at DESC
    `) as unknown as Blog[];
  }

  await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

  res.json({
    message: "✅ Blogs fetched successfully",
    blogs,
  });
});

export const getSingleBlog = TryCatch(async (req, res) => {
  const blogId = req.params.id;

  const cacheKey = `blog:${blogId}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    console.log("🔥 Serving single blog from Redis cache");
    return res.json(JSON.parse(cached));
  }

  const blog = (await sql`
    SELECT * FROM blogs WHERE id = ${blogId}
  `) as unknown as Blog[];

  if (!blog || blog.length === 0) {
    return res.status(404).json({
      message: "❌ No Blog found with this id",
    });
  }

  const { data: author } = await axios.get(
    `${process.env.USER_SERVICE}/api/users/${blog[0]!.author_id}`
  );

  const responseData = {
    blog: blog[0],
    author,
  };

  await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

  res.json({
    message: "✅ Blog fetched successfully",
    ...responseData,
  });
});
