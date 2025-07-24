// routes/characterRoutes.js - FINAL WORKING VERSION
import express from "express";
import {
  getAllCharacters,
  createCharacter,
  getCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacterOptions
} from "../controllers/characterControllers.js";
import isAuth from "../middlewares/isAuth.js";

console.log("🎭 CHARACTER ROUTES LOADING...");

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`🎭 CHARACTER ROUTE: ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ OPTIONS ROUTE - THIS FIXES THE 500 ERROR
router.get("/options", isAuth, (req, res) => {
  console.log("🎭 OPTIONS ROUTE HIT");
  getCharacterOptions(req, res);
});

// Test route (no auth)
router.get("/test", (req, res) => {
  console.log("🎭 TEST ROUTE HIT");
  res.json({
    message: "🎭 Character routes working!",
    timestamp: new Date().toISOString(),
    routes: [
      "GET /api/characters/options - Get creation options",
      "GET /api/characters - Get all characters", 
      "POST /api/characters - Create character",
      "GET /api/characters/:id - Get character",
      "PUT /api/characters/:id - Update character",
      "DELETE /api/characters/:id - Delete character"
    ]
  });
});

// All other routes need auth
router.use(isAuth);

// CRUD routes
router.get("/", (req, res) => {
  console.log("🎭 GET ALL CHARACTERS");
  getAllCharacters(req, res);
});

router.post("/", (req, res) => {
  console.log("🎭 CREATE CHARACTER");
  createCharacter(req, res);
});

router.get("/:id", (req, res) => {
  console.log(`🎭 GET CHARACTER: ${req.params.id}`);
  getCharacter(req, res);
});

router.put("/:id", (req, res) => {
  console.log(`🎭 UPDATE CHARACTER: ${req.params.id}`);
  updateCharacter(req, res);
});

router.delete("/:id", (req, res) => {
  console.log(`🎭 DELETE CHARACTER: ${req.params.id}`);
  deleteCharacter(req, res);
});

console.log("✅ CHARACTER ROUTES LOADED");

export default router;