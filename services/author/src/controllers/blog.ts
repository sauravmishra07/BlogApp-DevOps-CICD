import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import { invalidateCacheJob } from "../utils/rabbitmq.js";
import TryCatch from "../utils/TryCatch.js";
import { v2 as cloudinary } from "cloudinary";

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  if (!file) {
    res.status(400).json({
      message: "❌ No file to Upload",
    });
    return;
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer) {
    res.status(400).json({
      message: "❌ Failed to generate file buffer",
    });
    return;
  }

  const cloud = await cloudinary.uploader.upload(fileBuffer.content as string, {
    folder: "blog_images",
  });

  const result = await sql`
    INSERT INTO blogs (author_id, title, description, blogcontent, image, category, author) VALUES (${req.user?._id}, ${title}, ${description}, ${blogcontent}, ${cloud.secure_url}, ${category}) RETURNING *`;

    await invalidateCacheJob(["blogs:*"]);

  res.status(200).json({
    message: "✅ Blog created successfully",
    blog: result[0],
  });
});

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  const blog = await sql`
  SELECT * FROM blogs WHERE id = ${id}
`;

  // ensure we have a valid blog record
  if (!Array.isArray(blog) || blog.length === 0) {
    return res.status(404).json({ message: "❌ Blog not found" });
  }

  // narrow the existing blog and user id for type-safety
  const existing = blog[0] as {
    id?: number;
    title?: string;
    description?: string;
    blogcontent?: string;
    image?: string;
    category?: string;
    author?: string;
  };

  const userId = req.user && req.user._id;
  if (typeof userId !== "string") {
    return res.status(401).json({ message: "❌ Unauthorized" });
  }

  if (existing.author !== userId) {
    return res
      .status(403)
      .json({ message: "❌ Unauthorized to update this blog" });
  }

  // default to existing image; if a new file is provided upload and replace
  let imageUrl = existing.image;
  if (file) {
    const fileBuffer = getBuffer(file);
    if (!fileBuffer) {
      return res
        .status(400)
        .json({ message: "❌ Failed to generate file buffer" });
    }
    const cloud = await cloudinary.uploader.upload(
      fileBuffer.content as string,
      {
        folder: "blog_images",
      }
    );
    imageUrl = cloud.secure_url;
  }

  // perform update regardless of whether a new file was uploaded
  const updatedBlog = await sql`
    UPDATE blogs SET
      title = ${title || existing.title},
      description = ${description || existing.description},
      blogcontent = ${blogcontent || existing.blogcontent},
      image = ${imageUrl},
      category = ${category || existing.category}
    WHERE id = ${id}
    RETURNING *`;

  await invalidateCacheJob(["blogs:*", `blog:${id}`]);

  res
    .status(200)
    .json({ message: "✅ Blog updated successfully", blog: updatedBlog[0] });
});

export const deleteBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const blog = await sql`
  SELECT * FROM blogs WHERE id = ${req.params.id}
`;

  if (!Array.isArray(blog) || blog.length === 0) {
    return res.status(404).json({ message: "❌ Blog not found with this id" });
  }

  const existing = blog[0] as {
    author_id?: string;
    author?: string;
  };

  const userId = req.user && req.user._id;
  if (typeof userId !== "string") {
    return res.status(401).json({ message: "❌ Unauthorized" });
  }

  const blogAuthor = existing.author_id || existing.author;
  if (blogAuthor !== userId) {
    return res
      .status(403)
      .json({ message: "❌ You are not authorized to delete this blog" });
  }

  await sql`
    DELETE FROM savedblogs WHERE id = ${req.params.id}
  `;
  await sql`
    DELETE FROM comments WHERE blogid = ${req.params.id}
  `;
  await sql`
    DELETE FROM blogs WHERE id = ${req.params.id}
  `;
  await invalidateCacheJob(["blogs:*", `blog:${req.params.id}`]);
  res.status(200).json({
    message: "✅ Blog deleted successfully",
  });
});
