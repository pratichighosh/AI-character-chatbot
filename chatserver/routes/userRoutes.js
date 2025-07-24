// routes/userRoutes.js - MINIMAL WORKING VERSION
import express from "express";
import { loginUser, verifyUser, getMyProfile } from "../controllers/userControllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

console.log("👤 === USER ROUTES STARTING ===");

// Debug middleware
router.use((req, res, next) => {
  console.log(`\n🔍 USER ROUTE: ${req.method} ${req.originalUrl}`);
  console.log(`📦 Body:`, req.body);
  console.log(`🔍 Query:`, req.query);
  next();
});

// ============================================
// ✅ LOGIN - Send OTP
// ============================================
router.post("/login", async (req, res) => {
  console.log("📧 === LOGIN ROUTE HIT ===");
  try {
    await loginUser(req, res);
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
});

// ============================================
// ✅ VERIFY - Handle BOTH GET and POST
// ============================================

// POST route (correct method)
router.post("/verify", async (req, res) => {
  console.log("🔍 === VERIFY POST ROUTE ===");
  console.log("📦 POST Body:", req.body);
  
  try {
    await verifyUser(req, res);
  } catch (error) {
    console.error("❌ Verify POST error:", error);
    res.status(500).json({
      message: "Verification failed",
      error: error.message
    });
  }
});

// GET route (frontend compatibility - handles the 404 issue)
router.get("/verify", (req, res) => {
  console.log("🔍 === VERIFY GET ROUTE ===");
  console.log("⚠️ Frontend made GET request instead of POST");
  console.log("🔍 Query params:", req.query);
  
  // If OTP and token are in query params, process them
  const { otp, verifyToken } = req.query;
  
  if (otp && verifyToken) {
    console.log("🔄 Converting GET params to POST body...");
    req.body = { otp, verifyToken };
    return verifyUser(req, res);
  }
  
  // Return helpful response instead of 404
  res.status(400).json({
    success: false,
    message: "Use POST method for OTP verification",
    method: "This is a GET request to /verify",
    solution: "Frontend should use POST with OTP in request body",
    example: {
      method: "POST",
      url: "/api/user/verify",
      body: { otp: "123456", verifyToken: "token" }
    }
  });
});

// ============================================
// ✅ OTHER ROUTES
// ============================================

// Test route
router.get("/test", (req, res) => {
  console.log("🧪 USER TEST ROUTE");
  res.json({
    message: "✅ User routes working!",
    routes: [
      "POST /api/user/login ✅",
      "POST /api/user/verify ✅", 
      "GET /api/user/verify ✅ (fallback)",
      "GET /api/user/me ✅",
      "GET /api/user/test ✅"
    ]
  });
});

// Get profile
router.get("/me", isAuth, async (req, res) => {
  console.log("👤 GET PROFILE");
  try {
    await getMyProfile(req, res);
  } catch (error) {
    console.error("❌ Profile error:", error);
    res.status(500).json({
      message: "Failed to get profile",
      error: error.message
    });
  }
});

// ============================================
// ✅ CATCH-ALL (prevents 404s)
// ============================================
router.use("*", (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "POST /api/user/login",
      "POST /api/user/verify (RECOMMENDED)",
      "GET /api/user/verify (FALLBACK)", 
      "GET /api/user/me",
      "GET /api/user/test"
    ],
    note: "Both GET and POST supported for /verify"
  });
});

console.log("✅ USER ROUTES LOADED:");
console.log("✅ POST /login");
console.log("✅ POST /verify (main)");
console.log("✅ GET /verify (fallback)");
console.log("✅ GET /me");

export default router;