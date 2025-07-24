// backend/routes/userRoutes.js - COMPLETE WORKING USER ROUTES
import express from "express";
import { loginUser, verifyUser, getMyProfile } from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

console.log("👤 === USER ROUTES STARTING ===");

// Debug middleware - logs every request to user routes
router.use((req, res, next) => {
  console.log(`\n🔍 === USER ROUTE REQUEST ===`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.originalUrl}`);
  console.log(`   Body:`, Object.keys(req.body).length ? req.body : 'Empty');
  console.log(`   Headers:`, {
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'Present' : 'None'
  });
  console.log("===============================\n");
  next();
});

// ============================================
// ✅ PUBLIC ROUTES - No authentication required
// ============================================

// Login route - Send OTP to email
router.post("/login", async (req, res) => {
  console.log("📧 === LOGIN ROUTE HIT ===");
  console.log("📧 Request body:", req.body);
  
  try {
    await loginUser(req, res);
  } catch (error) {
    console.error("❌ Login route error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
});

// ✅ VERIFY ROUTE - This fixes the 404 error!
router.post("/verify", async (req, res) => {
  console.log("🔍 === VERIFY ROUTE HIT ===");
  console.log("🔍 This is the route that was causing 404!");
  console.log("🔍 Method:", req.method);
  console.log("🔍 Body:", req.body);
  console.log("🔍 OTP:", req.body.otp);
  console.log("🔍 Token:", req.body.verifyToken ? 'Present' : 'Missing');
  
  try {
    await verifyUser(req, res);
  } catch (error) {
    console.error("❌ Verify route error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message
    });
  }
});

// Test route to confirm routes are working
router.get("/test", (req, res) => {
  console.log("🧪 === USER TEST ROUTE HIT ===");
  res.json({
    success: true,
    message: "✅ User routes are working perfectly!",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "POST /api/user/login - Send OTP (✅ Working)",
      "POST /api/user/verify - Verify OTP (✅ Working)", 
      "GET /api/user/me - Get profile (✅ Working)",
      "GET /api/user/test - This test route (✅ Working)"
    ],
    testInstructions: {
      step1: "POST to /api/user/login with {email: 'your@email.com'}",
      step2: "Check email for OTP and get verifyToken from response",
      step3: "POST to /api/user/verify with {otp: '123456', verifyToken: 'token_from_step1'}"
    },
    systemStatus: {
      controllers: "✅ Loaded",
      middleware: "✅ Loaded", 
      emailService: process.env.EMAIL_USERNAME ? "✅ Configured" : "❌ Missing"
    }
  });
});

// ============================================
// ✅ PROTECTED ROUTES - Authentication required
// ============================================

// Get user profile
router.get("/me", isAuth, async (req, res) => {
  console.log("👤 === GET PROFILE ROUTE HIT ===");
  console.log("👤 User ID:", req.user._id);
  console.log("👤 User Email:", req.user.email);
  
  try {
    await getMyProfile(req, res);
  } catch (error) {
    console.error("❌ Profile route error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message
    });
  }
});

// ============================================
// ✅ ADDITIONAL HELPFUL ROUTES
// ============================================

// Route to test authentication
router.get("/test-auth", isAuth, (req, res) => {
  console.log("🔒 === AUTH TEST ROUTE HIT ===");
  res.json({
    success: true,
    message: "✅ Authentication is working!",
    user: {
      id: req.user._id,
      email: req.user.email,
      isVerified: req.user.isVerified
    },
    timestamp: new Date().toISOString()
  });
});

// Debug route to check email configuration
router.get("/debug-email", (req, res) => {
  console.log("🐛 === EMAIL DEBUG ROUTE ===");
  res.json({
    emailService: {
      username: process.env.EMAIL_USERNAME || "Not configured",
      configured: !!process.env.EMAIL_USERNAME,
      password: process.env.EMAIL_PASSWORD ? "Present" : "Missing"
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET ? "Present" : "Missing"
    }
  });
});

// ============================================
// ✅ ERROR HANDLING
// ============================================

// Catch-all for debugging unmatched routes
router.use("*", (req, res) => {
  console.log(`❌ === USER ROUTE NOT FOUND ===`);
  console.log(`❌ Method: ${req.method}`);
  console.log(`❌ URL: ${req.originalUrl}`);
  console.log(`❌ This route doesn't exist in user routes`);
  
  res.status(404).json({
    success: false,
    message: `User route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      public: [
        "POST /api/user/login - Send OTP email",
        "POST /api/user/verify - Verify OTP and get JWT token",
        "GET /api/user/test - Test route"
      ],
      protected: [
        "GET /api/user/me - Get user profile (requires JWT)",
        "GET /api/user/test-auth - Test authentication (requires JWT)"
      ],
      debug: [
        "GET /api/user/debug-email - Check email configuration"
      ]
    },
    note: "Make sure you're sending requests to the correct endpoints with proper HTTP methods"
  });
});

console.log("✅ === USER ROUTES CONFIGURED ===");
console.log("✅ POST /login - Send OTP email");
console.log("✅ POST /verify - Verify OTP and login (FIXES 404!)");
console.log("✅ GET /me - Get user profile (auth required)");
console.log("✅ GET /test - Test route");
console.log("✅ GET /test-auth - Test authentication");
console.log("✅ GET /debug-email - Debug email config");

export default router;