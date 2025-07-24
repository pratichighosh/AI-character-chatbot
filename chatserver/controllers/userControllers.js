// controllers/userControllers.js - COMPLETE WORKING VERSION

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendMail } from "../middlewares/sendMail.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const loginUser = async (req, res) => {
  try {
    const { email } = req.body;

    console.log(`\n📧 === LOGIN REQUEST ===`);
    console.log(`📧 Email: ${email}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    if (!email) {
      console.log(`❌ Validation failed: Email is required`);
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`❌ Validation failed: Invalid email format`);
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log(`🧹 Cleaned email: ${cleanEmail}`);

    // Find or create user
    let user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      console.log(`👤 Creating new user for: ${cleanEmail}`);
      user = await User.create({ email: cleanEmail });
      console.log(`✅ New user created with ID: ${user._id}`);
    } else {
      console.log(`👤 Existing user found with ID: ${user._id}`);
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`🔑 Generated OTP: ${otp} for ${cleanEmail}`);

    // Create verification token
    const verifyToken = jwt.sign(
      { 
        email: cleanEmail, 
        otp,
        userId: user._id,
        generated: new Date().toISOString()
      },
      process.env.ACTIVATION_SECRET,
      { expiresIn: "10m" }
    );

    console.log(`🎫 Verification token created (expires in 10 minutes)`);

    try {
      console.log(`📤 === SENDING OTP EMAIL ===`);
      
      // Send OTP email
      const emailResult = await sendMail(cleanEmail, otp);
      
      console.log(`\n🎉 === OTP EMAIL SENT SUCCESSFULLY ===`);
      console.log(`📨 Message ID: ${emailResult.messageId}`);
      console.log(`📤 Sent from: ${emailResult.sentFrom}`);
      console.log(`📧 Sent to: ${emailResult.sentTo || cleanEmail}`);

      // Return success response
      res.json({
        message: "OTP sent to your email successfully",
        verifyToken,
        email: cleanEmail,
        expiresIn: "10 minutes",
        emailSent: true,
        sentFrom: emailResult.sentFrom || process.env.EMAIL_USERNAME
      });

    } catch (emailError) {
      console.error(`\n❌ === FAILED TO SEND OTP EMAIL ===`);
      console.error(`❌ Email error:`, emailError.message);
      
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        error: emailError.message,
        emailConfigured: !!process.env.EMAIL_USERNAME
      });
    }

  } catch (error) {
    console.error(`\n❌ === LOGIN REQUEST FAILED ===`);
    console.error(`❌ Error:`, error.message);
    console.error(`❌ Stack:`, error.stack);
    
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { otp, verifyToken } = req.body;

    console.log(`\n🔍 === OTP VERIFICATION REQUEST ===`);
    console.log(`🔢 Received OTP: ${otp}`);
    console.log(`🎫 Verify Token: ${verifyToken ? 'Present' : 'Missing'}`);
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    if (!otp || !verifyToken) {
      console.log(`❌ Missing required fields`);
      return res.status(400).json({ 
        message: "OTP and verification token are required",
        received: {
          otp: !!otp,
          verifyToken: !!verifyToken
        }
      });
    }

    if (!/^\d{6}$/.test(otp.toString())) {
      console.log(`❌ OTP format validation failed: ${otp}`);
      return res.status(400).json({ 
        message: "OTP must be 6 digits"
      });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(verifyToken, process.env.ACTIVATION_SECRET);
      console.log(`✅ Token verified successfully`);
      console.log(`📧 Token email: ${decoded.email}`);
      console.log(`🔑 Expected OTP: ${decoded.otp}`);
      console.log(`🔑 Received OTP: ${otp}`);

      // Check if OTP matches
      if (Number(otp) !== decoded.otp) {
        console.log(`❌ OTP mismatch: received=${otp}, expected=${decoded.otp}`);
        return res.status(400).json({ 
          message: "Invalid OTP. Please check and try again."
        });
      }

      console.log(`✅ OTP verification successful for: ${decoded.email}`);

      // Find user
      let user = await User.findOne({ email: decoded.email });

      if (!user) {
        console.log(`👤 User not found, creating new user for: ${decoded.email}`);
        user = await User.create({ email: decoded.email });
      }

      console.log(`👤 User authenticated: ${user._id}`);

      // Generate JWT token for session
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          loginTime: new Date().toISOString()
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      console.log(`🎫 Session token generated (expires in 30 days)`);
      console.log(`\n🎉 === LOGIN SUCCESSFUL ===`);
      console.log(`👤 User: ${decoded.email}`);
      console.log(`🆔 User ID: ${user._id}`);

      res.json({
        message: "Login successful",
        user: {
          _id: user._id,
          email: user.email,
          createdAt: user.createdAt
        },
        token,
        loginTime: new Date().toISOString()
      });

    } catch (tokenError) {
      console.error(`❌ Token verification failed:`, tokenError.message);
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(400).json({ 
          message: "OTP has expired. Please request a new one.",
          expired: true
        });
      }
      
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(400).json({ 
          message: "Invalid verification token. Please try login again.",
          invalid: true
        });
      }

      throw tokenError;
    }

  } catch (error) {
    console.error(`\n❌ === OTP VERIFICATION FAILED ===`);
    console.error(`❌ Error:`, error.message);
    
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    console.log(`👤 Profile request for user: ${req.user._id}`);
    
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log(`❌ User not found: ${req.user._id}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`✅ Profile fetched for: ${user.email}`);

    res.json({
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    console.error(`❌ Get profile error:`, error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message
    });
  }
};