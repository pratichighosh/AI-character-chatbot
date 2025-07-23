import express from "express";
import { loginUser, verifyUser, getMyProfile } from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Public routes - No authentication required
router.post("/login", loginUser);    // Send OTP to email
router.post("/verify", verifyUser);  // Verify OTP and login

// Protected routes - Authentication required
router.get("/me", isAuth, getMyProfile);  // Get user profile

export default router;
