// routes/characterRoutes.js - UPDATED WITH DEBUGGING
import express from "express";
import { 
  getAllCharacters, 
  createCharacter, 
  getCharacter, 
  updateCharacter, 
  deleteCharacter 
} from "../controllers/characterControllers.js";
import isAuth from "../middlewares/isAuth.js";

console.log("🎭 CHARACTER ROUTES MODULE LOADING...");

const router = express.Router();

// Debug middleware to track route hits
router.use((req, res, next) => {
  console.log(`🎭 CHARACTER ROUTE HIT: ${req.method} ${req.originalUrl}`);
  console.log(`🎭 User: ${req.user ? req.user._id : 'Not authenticated'}`);
  next();
});

// All character routes require authentication
router.use(isAuth);

// Test route (no auth required for debugging)
router.get("/test", (req, res) => {
  console.log("🎭 Character test route hit");
  res.json({ 
    message: "🎭 Character routes are working!",
    timestamp: new Date().toISOString(),
    routes: [
      "GET /api/characters - Get all characters",
      "POST /api/characters - Create character",
      "GET /api/characters/:id - Get single character",
      "PUT /api/characters/:id - Update character", 
      "DELETE /api/characters/:id - Delete character"
    ],
    debug: {
      authenticated: !!req.user,
      userId: req.user?._id
    }
  });
});

// Character CRUD routes
router.get("/", (req, res) => {
  console.log("🎭 GET all characters route");
  getAllCharacters(req, res);
});

router.post("/", (req, res) => {
  console.log("🎭 CREATE character route");
  console.log("🎭 Request body:", req.body);
  createCharacter(req, res);
});

router.get("/:id", (req, res) => {
  console.log(`🎭 GET character route: ${req.params.id}`);
  getCharacter(req, res);
});

router.put("/:id", (req, res) => {
  console.log(`🎭 UPDATE character route: ${req.params.id}`);
  updateCharacter(req, res);
});

router.delete("/:id", (req, res) => {
  console.log(`🎭 DELETE character route: ${req.params.id}`);
  deleteCharacter(req, res);
});

console.log("✅ CHARACTER ROUTES MODULE LOADED SUCCESSFULLY");

export default router;