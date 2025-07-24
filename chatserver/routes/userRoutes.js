// routes/userRoutes.js - FINAL FIX - HANDLES BOTH GET AND POST

import express from "express";
import { loginUser, verifyUser, getMyProfile } from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

console.log("👤 === USER ROUTES LOADING ===");

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔍 USER ROUTE: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ LOGIN ROUTE - Working
router.post("/login", async (req, res) => {
  console.log("📧 LOGIN ROUTE HIT");
  try {
    await loginUser(req, res);
  } catch (error) {
    console.error("❌ Login route error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

// ✅ FINAL FIX: HANDLE GET REQUESTS TO VERIFY (Return success message)
router.get("/verify", (req, res) => {
  console.log("✅ GET /verify - Returning success response");
  res.json({
    success: true,
    message: "✅ Verify page loaded successfully",
    instructions: "Please enter your OTP and click the Verify button",
    method: "GET request handled",
    timestamp: new Date().toISOString()
  });
});

// ✅ POST VERIFY ROUTE - This is the one that actually does verification
router.post("/verify", async (req, res) => {
  console.log("🔍 POST /verify - DOING ACTUAL VERIFICATION");
  console.log("🔍 Body:", req.body);

  if (!req.body.otp || !req.body.verifyToken) {
    return res.status(400).json({
      message: "OTP and verification token are required"
    });
  }

  try {
    await verifyUser(req, res);
  } catch (error) {
    console.error("❌ Verify route error:", error);
    res.status(500).json({
      message: "Verification failed",        
      error: error.message
    });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({
    message: "✅ User routes working!",
    availableRoutes: [
      "POST /api/user/login - Send OTP",
      "GET /api/user/verify - Page load (✅ FIXED!)",
      "POST /api/user/verify - Verify OTP (✅ WORKING!)",
      "GET /api/user/me - Get profile"
    ]
  });
});

// Get user profile
router.get("/me", isAuth, async (req, res) => {
  try {
    await getMyProfile(req, res);
  } catch (error) {
    console.error("❌ Profile route error:", error);
    res.status(500).json({
      message: "Failed to get profile",
      error: error.message
    });
  }
});

console.log("✅ USER ROUTES CONFIGURED - HANDLES BOTH GET AND POST TO /verify");

export default router;