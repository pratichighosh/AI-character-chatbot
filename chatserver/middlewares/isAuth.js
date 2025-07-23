// middlewares/isAuth.js - CORRECTED VERSION
import jwt from "jsonwebtoken";

// FIXED: Try both import styles for User model
let User;
try {
  // Try named import first
  const userModule = await import("../models/User.js");
  User = userModule.User || userModule.default;
} catch (error) {
  console.error("❌ Failed to import User model:", error.message);
  throw error;
}

const isAuth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    
    console.log(`🔐 Authentication check for ${req.method} ${req.path}`);
    
    // Check for Authorization header first (preferred method)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log(`🎫 Token found in Authorization header`);
    }
    // Fallback to token header for backward compatibility
    else if (req.headers.token) {
      token = req.headers.token;
      console.log(`🎫 Token found in token header`);
    }

    if (!token) {
      console.log(`❌ No token provided for ${req.path}`);
      return res.status(403).json({
        message: "Access Denied. No token provided.",
        hint: "Include Authorization: Bearer <token> header or token header"
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token verified for user: ${decoded.id}`);
    
    // Find user by ID from token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log(`❌ User not found for ID: ${decoded.id}`);
      return res.status(403).json({
        message: "Access Denied. User not found."
      });
    }

    console.log(`✅ User authenticated: ${user.email}`);
    
    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error("❌ Authentication error:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      console.log(`❌ Token expired for ${req.path}`);
      return res.status(403).json({
        message: "Access Denied. Token has expired.",
        hint: "Please login again to get a new token"
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.log(`❌ Invalid token format for ${req.path}`);
      return res.status(403).json({
        message: "Access Denied. Invalid token format."
      });
    }
    
    return res.status(403).json({
      message: "Access Denied. Token verification failed.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// IMPORTANT: Export as default
export default isAuth;

// Also export as named export for compatibility
export { isAuth };