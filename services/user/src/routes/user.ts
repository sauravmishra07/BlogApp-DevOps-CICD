import express from 'express';

import { getUserProfile, loginUser, myProfile, updateProfilePicture, updateUser,  } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
import uploadFile from '../middleware/multer.js';

const router = express.Router();

router.post("/login", loginUser);
router.get("/profile", isAuth, myProfile );
router.get("/user/:id", isAuth, getUserProfile);
router.put("/user/update", isAuth, updateUser);
router.post("/user/update/pic", isAuth, uploadFile, updateProfilePicture);

export default router;