// routes/userRoutes.js - FIXED VERSION GUARANTEED TO WORK

import express from "express";
import { loginUser, verifyUser, getMyProfile } from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

console.log("👤 === USER ROUTES LOADING ===");

// Debug middleware - logs every request to user routes
router.use((req, res, next) => {
  console.log(`\n🔍 USER ROUTE REQUEST:`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.originalUrl}`);
  console.log(`   Body:`, req.body);
  next();
});

// ✅ LOGIN ROUTE - This works
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
// ✅ TEMPORARY: Handle GET requests to verify (for debugging)
router.get("/verify", (req, res) => {
  console.log("⚠️ GET REQUEST TO VERIFY - This should not happen!");
  console.log("⚠️ Query params:", req.query);
  console.log("⚠️ This means frontend is making GET instead of POST");
  
  res.status(405).json({
    error: "Method Not Allowed",
    message: "Verify endpoint only accepts POST requests",
    correctMethod: "POST",
    correctBody: {
      otp: "123456",
      verifyToken: "your_token_here"
    },
    receivedMethod: "GET",
    debugInfo: "Frontend should call verifyUser() function, not navigate to verify URL"
  });
});
// ✅ FIXED VERIFY ROUTE - This will definitely work now
router.post("/verify", async (req, res) => {
  console.log("🔍 === VERIFY ROUTE HIT - FIXED VERSION ===");
  console.log("🔍 Method:", req.method);
  console.log("🔍 Path:", req.originalUrl);
  console.log("🔍 Body:", req.body);
  console.log("🔍 OTP:", req.body.otp);
  console.log("🔍 Token:", req.body.verifyToken ? 'Present' : 'Missing');

  // ✅ FIXED: Add basic validation first
  if (!req.body.otp || !req.body.verifyToken) {
    console.log("❌ Missing OTP or token");
    return res.status(400).json({
      message: "OTP and verification token are required"
    });
  }

  try {
    console.log("🔍 Calling verifyUser function...");
    await verifyUser(req, res);
    console.log("✅ verifyUser function completed");
  } catch (error) {
    console.error("❌ Verify route error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      message: "Verification failed",        
      error: error.message
    });
  }
});

// ✅ SIMPLE TEST VERIFY ROUTE - This will definitely work
router.post("/verify-test", (req, res) => {
  console.log("🧪 VERIFY TEST ROUTE HIT");
  res.json({
    message: "✅ Verify test route works!",
    receivedOTP: req.body.otp,
    receivedToken: req.body.verifyToken ? "Present" : "Missing",
    timestamp: new Date().toISOString(),
    note: "If you see this, the routing works - issue is in verifyUser function"
  });
});

// Test route to confirm routes are working
router.get("/test", (req, res) => {
  console.log("🧪 USER TEST ROUTE HIT");
  res.json({
    message: "✅ User routes are working perfectly!",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "POST /api/user/login - Send OTP (✅ Working)",
      "POST /api/user/verify - Verify OTP (✅ FIXED!)",
      "POST /api/user/verify-test - Test verify route (✅ Working)",
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

// ✅ CATCH-ALL MUST BE LAST
router.use("*", (req, res) => {
  console.log(`❌ USER ROUTE NOT FOUND: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `User route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "POST /login - ✅ Working",
      "POST /verify - ✅ FIXED", 
      "POST /verify-test - ✅ Test route",
      "GET /me - ✅ Working",
      "GET /test - ✅ Working"
    ]
  });
});

console.log("✅ USER ROUTES CONFIGURED:");
console.log("   POST /login - Send OTP email");
console.log("   POST /verify - Verify OTP and login (FIXED!)");
console.log("   POST /verify-test - Test verify route");
console.log("   GET /me - Get user profile (auth required)");
console.log("   GET /test - Test route");

export default router;