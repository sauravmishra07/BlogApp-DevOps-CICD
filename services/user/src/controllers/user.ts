import type { Request, Response } from "express";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from "cloudinary";
import { oauth2client } from "../utils/GoogleConfig.js";
import axios from "axios";

export const loginUser = TryCatch(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({
      message: "❌ Authorization code is required",
    });
    return;
  }

  const googleRes = await oauth2client.getToken(code);

  
  oauth2client.setCredentials(googleRes.tokens);
  
  const userRes = await axios.get(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${googleRes.tokens.access_token}`
  )

  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, image: picture });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "5d",
  });

  res.status(200).json({
    message: "✅ User logged in successfully",
    user,
    token,
  });
});

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    res.json(user);
  }
);

export const getUserProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        message: "❌ User not found",
      });
      return;
    }
    res.json(user);
  }
);

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { name, bio, facebook, instagram, linkedin } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      name,
      bio,
      facebook,
      instagram,
      linkedin,
    },
    {
      new: true,
    }
  );

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "5d",
  });

  res.status(200).json({
    message: "✅ User Updated successfully",
    user,
    token,
  });
});

export const updateProfilePicture = TryCatch(
  async (req: AuthenticatedRequest, res) => {
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
    const cloud = await cloudinary.uploader.upload(
      fileBuffer.content as string,
      {
        folder: "profile_pictures",
      }
    );

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        image: cloud.secure_url,
      },
      {
        new: true,
      }
    );
    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
      expiresIn: "5d",
    });

    res.status(200).json({
      message: "✅ User Updated successfully",
      user,
      token,
    });
  }
);
