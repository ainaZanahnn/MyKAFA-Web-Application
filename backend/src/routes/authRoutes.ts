/** @format */

//endpoint paths
import express from "express";
import { registerUser, loginUser, refreshToken, verifyToken } from "../controllers/authControllers";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.get("/verify", verifyToken);

export default router;
