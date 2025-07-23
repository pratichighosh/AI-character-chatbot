// routes/chatRoutes.js - FIXED SYNTAX
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createChat,
  getAllChats,
  addConversation,
  getConversation,
  deleteChat
} from "../controllers/chatControllers.js";

const router = express.Router();

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    message: "💬 Chat routes are working!",
    timestamp: new Date().toISOString(),
    status: "active"
  });
});

// Create new chat
router.post("/new", isAuth, createChat);

// Get all chats for user
router.get("/all", isAuth, getAllChats);

// Get conversations for a specific chat
router.get("/:id", isAuth, getConversation);

// Add conversation to chat (send message)
router.post("/:id", isAuth, addConversation);

// Delete chat
router.delete("/:id", isAuth, deleteChat);

export default router;