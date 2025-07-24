
// ✅ NEW: Frontend debugging route
router.get("/debug-frontend", (req, res) => {
  console.log("🐛 === FRONTEND DEBUG ROUTE ===");
  res.json({
    message: "Frontend debugging information",
    commonIssues: {
      "404 on verify": "Frontend making GET instead of POST request",
      "Wrong endpoint": "Check if frontend is using correct URL",
      "Missing data": "Ensure OTP and verifyToken are in request body for POST"
    },
    frontendFix: {
      correctMethod: "POST",
      correctURL: "/api/user/verify", 
      correctBody: {
        otp: "123456",
        verifyToken: "token_from_login"
      },
      incorrectMethod: "GET (causes 404 or wrong behavior)"
    },
    testCommands: [
      "curl -X POST /api/user/verify -H 'Content-Type: application/json' -d '{\"otp\":\"123456\",\"verifyToken\":\"token\"}'",
      "Should NOT use: curl -X GET /api/user/verify?otp=123456&verifyToken=token"
    ]
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
        "POST /api/user/verify - Verify OTP and get JWT token (RECOMMENDED)",
        "GET /api/user/verify - Verify OTP (FALLBACK FOR FRONTEND)",
        "GET /api/user/test - Test route"
      ],
      protected: [
        "GET /api/user/me - Get user profile (requires JWT)",
        "GET /api/user/test-auth - Test authentication (requires JWT)"
      ],
      debug: [
        "GET /api/user/debug-email - Check email configuration",
        "GET /api/user/debug-frontend - Frontend debugging help"
      ]
    },
    
    troubleshooting: {
      issue: req.method === 'GET' && req.originalUrl.includes('verify') ? 
        "Frontend making GET request to verify - should use POST" : 
        "Route not found",
      solution: req.method === 'GET' && req.originalUrl.includes('verify') ?
        "Change frontend to use POST /api/user/verify with OTP in request body" :
        "Check the correct endpoint and HTTP method",
      supportedMethods: "GET verify route now supported as fallback"
    },
    
    note: "Both GET and POST are now supported for /verify endpoint for frontend compatibility"
  });
});

console.log("✅ === USER ROUTES CONFIGURED ===");
console.log("✅ POST /login - Send OTP email");
console.log("✅ POST /verify - Verify OTP and login (RECOMMENDED)");
console.log("✅ GET /verify - Verify OTP (FRONTEND COMPATIBILITY)");
console.log("✅ GET /me - Get user profile (auth required)");
console.log("✅ GET /test - Test route");
console.log("✅ GET /test-auth - Test authentication");
console.log("✅ GET /debug-email - Debug email config");
console.log("✅ GET /debug-frontend - Frontend debugging help");

export default router;