/** @format */

import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";
import {
  getUsers,
  getUser,
  updateUserController,
  suspendUser,
  deleteUserController,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
} from "../controllers/userControllers";

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles/"); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    // Allow image files only
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, JPG, PNG, GIF) are allowed"));
    }
  },
});

// Profile routes for authenticated users (students/guardians) - no admin required
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put(
  "/profile/picture",
  protect,
  upload.single("profilePicture"),
  updateProfilePicture
);

// All other routes require authentication and admin role
router.use(protect);
router.use(verifyAdmin);

router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUserController);
router.patch("/:id/suspend", suspendUser);
router.delete("/:id", deleteUserController);

export default router;
