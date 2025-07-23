// routes/chatRoutes.js - COMPLETE REPLACEMENT

import express from "express";
import {
  createChat,
  getAllChats,
  addConversation,
  getConversation,
  deleteChat,
  generateResponse
} from "../controllers/chatControllers.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Debug middleware to track route hits
router.use((req, res, next) => {
  console.log(`🔍 CHAT ROUTE HIT: ${req.method} ${req.path} | Original URL: ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(isAuth);

// ========================================
// CRITICAL: EXACT ROUTES MUST COME FIRST
// ========================================

// Route 1: GET /all - MUST be before /:id
router.get("/all", (req, res) => {
  console.log("✅ HIT /all route - calling getAllChats");
  getAllChats(req, res);
});

// Route 2: POST /new - MUST be before /:id  
router.post("/new", (req, res) => {
  console.log("✅ HIT /new route - calling createChat");
  createChat(req, res);
});

// Route 3: POST /message - Direct messaging
router.post("/message", async (req, res) => {
  console.log("✅ HIT /message route - direct messaging");
  try {
    const { message, chatId } = req.body;
    const userId = req.user._id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`📨 Direct message from user ${userId}: ${message}`);

    // Generate AI response
    const aiResponse = await generateResponse(message.trim());

    if (chatId) {
      // Save to existing chat
      req.params.id = chatId;
      req.body.question = message;
      req.body.answer = aiResponse;
      return addConversation(req, res);
    }

    // Return response without saving
    res.json({
      success: true,
      userMessage: message,
      aiResponse: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Direct message error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate response'
    });
  }
});

// ========================================
// PARAMETERIZED ROUTES COME LAST
// ========================================

// Route 4: GET /:id - Get conversations for chat
router.get("/:id", (req, res) => {
  const chatId = req.params.id;
  console.log(`✅ HIT GET /:id route with ID: ${chatId}`);
  
  // Safety check for reserved words
  if (chatId === 'all' || chatId === 'new' || chatId === 'message') {
    console.log(`❌ ROUTE CONFLICT: ID "${chatId}" is a reserved route name`);
    return res.status(400).json({ 
      message: "Invalid chat ID",
      error: `"${chatId}" is a reserved route name`
    });
  }
  
  getConversation(req, res);
});

// Route 5: POST /:id - Add message to chat
router.post("/:id", (req, res) => {
  const chatId = req.params.id;
  console.log(`✅ HIT POST /:id route with ID: ${chatId}`);
  
  // Safety check for reserved words
  if (chatId === 'all' || chatId === 'new' || chatId === 'message') {
    console.log(`❌ ROUTE CONFLICT: ID "${chatId}" is a reserved route name`);
    return res.status(400).json({ 
      message: "Invalid chat ID",
      error: `"${chatId}" is a reserved route name`
    });
  }
  
  addConversation(req, res);
});

// Route 6: DELETE /:id - Delete chat
router.delete("/:id", (req, res) => {
  const chatId = req.params.id;
  console.log(`✅ HIT DELETE /:id route with ID: ${chatId}`);
  
  // Safety check for reserved words
  if (chatId === 'all' || chatId === 'new' || chatId === 'message') {
    console.log(`❌ ROUTE CONFLICT: ID "${chatId}" is a reserved route name`);
    return res.status(400).json({ 
      message: "Invalid chat ID",
      error: `"${chatId}" is a reserved route name`
    });
  }
  
  deleteChat(req, res);
});

// Catch unmatched routes for debugging
router.use("*", (req, res) => {
  console.log(`❌ UNMATCHED CHAT ROUTE: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Chat route not found",
    attempted: `${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /api/chat/all",
      "POST /api/chat/new", 
      "POST /api/chat/message",
      "GET /api/chat/:id",
      "POST /api/chat/:id", 
      "DELETE /api/chat/:id"
    ]
  });
});

export default router;