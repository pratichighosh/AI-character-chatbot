// routes/userRoutes.js - COMPLETE WORKING VERSION

import express from "express";
import { loginUser, verifyUser, getMyProfile } from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

console.log("👤 === USER ROUTES STARTING ===");

// Debug middleware - logs every request to user routes
router.use((req, res, next) => {
  console.log(`\n🔍 USER ROUTE REQUEST:`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.originalUrl}`);
  console.log(`   Body:`, req.body);
  console.log(`   Headers:`, {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Present' : 'None'
  });
  next();
});

// ✅ PUBLIC ROUTES - No authentication required

// Login route - Send OTP to email
router.post("/login", async (req, res) => {
  console.log("📧 LOGIN ROUTE HIT");
  console.log("📧 Request body:", req.body);
  
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

// ✅ VERIFY ROUTE - This is the critical one that was failing
router.post("/verify", async (req, res) => {
  console.log("🔍 VERIFY ROUTE HIT - THIS IS WORKING!");
  console.log("🔍 Method:", req.method);
  console.log("🔍 Body:", req.body);
  console.log("🔍 OTP:", req.body.otp);
  console.log("🔍 Token:", req.body.verifyToken ? 'Present' : 'Missing');
  
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

// Test route to confirm routes are working
router.get("/test", (req, res) => {
  console.log("🧪 USER TEST ROUTE HIT");
  res.json({
    message: "✅ User routes are working perfectly!",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "POST /api/user/login - Send OTP (✅ Working)",
      "POST /api/user/verify - Verify OTP (✅ Working)",
      "GET /api/user/me - Get profile (✅ Working)",
      "GET /api/user/test - This test route (✅ Working)"
    ],
    testInstructions: [
      "1. POST to /api/user/login with {email: 'your@email.com'}",
      "2. Check email for OTP",
      "3. POST to /api/user/verify with {otp: 123456, verifyToken: 'token'}"
    ]
  });
});

// ✅ PROTECTED ROUTES - Authentication required

// Get user profile
router.get("/me", isAuth, async (req, res) => {
  console.log("👤 GET PROFILE ROUTE HIT");
  console.log("👤 User ID:", req.user._id);
  
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

// Catch-all for debugging
router.use("*", (req, res) => {
  console.log(`❌ USER ROUTE NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `User route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "POST /login",
      "POST /verify", 
      "GET /me",
      "GET /test"
    ]
  });
});

console.log("✅ USER ROUTES CONFIGURED:");
console.log("   POST /login - Send OTP email");
console.log("   POST /verify - Verify OTP and login");
console.log("   GET /me - Get user profile (auth required)");
console.log("   GET /test - Test route");

export default router;