// controllers/characterControllers.js - FINAL WORKING VERSION
import { Character } from "../models/Character.js";

// ✅ Get character creation options (THIS FIXES THE 500 ERROR)
export const getCharacterOptions = async (req, res) => {
  try {
    console.log("🎭 CHARACTER OPTIONS REQUEST");
    
    const characterOptions = {
      personalityTraits: [
        "Wise and thoughtful, speaks with deep understanding",
        "Curious and analytical, loves exploring ideas", 
        "Friendly and encouraging, always supportive",
        "Humorous and witty, uses jokes and metaphors",
        "Calm and patient, speaks slowly and clearly",
        "Energetic and enthusiastic, very expressive",
        "Mysterious and philosophical, speaks in riddles",
        "Professional and formal, business-like approach",
        "Creative and artistic, thinks outside the box",
        "Practical and direct, gets straight to the point",
        "Empathetic and caring, emotionally supportive",
        "Intellectual and scholarly, loves complex topics",
        "Playful and childlike, maintains wonder and joy",
        "Bold and confident, takes charge of situations",
        "Gentle and nurturing, like a caring teacher"
      ],
      speakingStyles: [
        "Uses scientific metaphors and explains things logically",
        "Speaks in poetic, beautiful language with imagery",
        "Uses simple, clear explanations that anyone can understand",
        "Tells stories and examples to make points",
        "Asks thoughtful questions to guide learning",
        "Uses humor and jokes to make conversations fun",
        "Speaks formally with proper grammar and vocabulary",
        "Uses modern slang and casual expressions",
        "Gives step-by-step instructions and practical advice",
        "Speaks philosophically about deeper meanings",
        "Uses encouraging words and positive reinforcement",
        "Challenges ideas and plays devil's advocate",
        "Speaks dramatically with lots of emotion",
        "Uses technical terms and industry jargon",
        "Keeps responses short and to the point"
      ],
      languages: [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'bengali', label: 'Bengali' },
        { value: 'spanish', label: 'Spanish' },
        { value: 'french', label: 'French' },
        { value: 'german', label: 'German' },
        { value: 'italian', label: 'Italian' },
        { value: 'portuguese', label: 'Portuguese' },
        { value: 'russian', label: 'Russian' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'korean', label: 'Korean' },
        { value: 'chinese', label: 'Chinese (Mandarin)' },
        { value: 'arabic', label: 'Arabic' },
        { value: 'multilingual', label: 'Multilingual' }
      ],
      responseStyles: [
        { value: 'conversational', label: 'Conversational - Natural, flowing dialogue' },
        { value: 'educational', label: 'Educational - Teaching and explaining' },
        { value: 'supportive', label: 'Supportive - Encouraging and helpful' },
        { value: 'analytical', label: 'Analytical - Logical and detailed' },
        { value: 'creative', label: 'Creative - Imaginative and artistic' },
        { value: 'professional', label: 'Professional - Business-like and formal' },
        { value: 'casual', label: 'Casual - Relaxed and informal' },
        { value: 'enthusiastic', label: 'Enthusiastic - Energetic and excited' },
        { value: 'calm', label: 'Calm - Peaceful and soothing' },
        { value: 'humorous', label: 'Humorous - Funny and entertaining' },
        { value: 'philosophical', label: 'Philosophical - Deep and thoughtful' },
        { value: 'practical', label: 'Practical - Focused on solutions' }
      ]
    };

    console.log(`✅ CHARACTER OPTIONS SENT`);
    res.json(characterOptions);

  } catch (error) {
    console.error("❌ CHARACTER OPTIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch character options",
      error: error.message
    });
  }
};

// Get all characters
export const getAllCharacters = async (req, res) => {
  try {
    console.log("🎭 GET ALL CHARACTERS");
    const userId = req.user._id;
    
    const characters = await Character.find({
      $or: [
        { isPublic: true },
        { creator: userId }
      ]
    }).sort({ usageCount: -1, createdAt: -1 });

    console.log(`✅ FOUND ${characters.length} CHARACTERS`);

    res.json({
      characters,
      count: characters.length
    });

  } catch (error) {
    console.error("❌ GET CHARACTERS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch characters",
      error: error.message
    });
  }
};

// Create new character
export const createCharacter = async (req, res) => {
  try {
    console.log("🎭 CREATE CHARACTER STARTING");
    console.log("📝 REQUEST BODY:", req.body);
    
    const userId = req.user._id;
    const { 
      name, 
      description, 
      personality, 
      speakingStyle, 
      background, 
      avatar, 
      category, 
      tags, 
      expertise,
      primaryLanguage,
      responseStyle,
      isPublic 
    } = req.body;

    // Validate required fields
    if (!name || !description || !personality || !speakingStyle) {
      console.log("❌ VALIDATION FAILED - Missing required fields");
      return res.status(400).json({
        message: "Name, description, personality, and speaking style are required"
      });
    }

    // Create character data
    const characterData = {
      name: name.trim(),
      description: description.trim(),
      personality: personality.trim(),
      speakingStyle: speakingStyle.trim(),
      background: background ? background.trim() : "",
      avatar: avatar || "🤖",
      category: category || "custom",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map(exp => exp.trim()) : []),
      primaryLanguage: primaryLanguage || "english",
      responseStyle: responseStyle || "conversational",
      isPublic: isPublic || false,
      creator: userId
    };

    console.log("🎭 CREATING CHARACTER WITH DATA:", characterData);

    const character = await Character.create(characterData);

    console.log(`✅ CHARACTER CREATED: ${character.name} (ID: ${character._id})`);

    res.status(201).json({
      message: "Character created successfully",
      character
    });

  } catch (error) {
    console.error("❌ CREATE CHARACTER ERROR:", error);
    console.error("❌ ERROR STACK:", error.stack);
    res.status(500).json({
      message: "Failed to create character",
      error: error.message
    });
  }
};

// Get single character
export const getCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const character = await Character.findOne({
      _id: id,
      $or: [
        { isPublic: true },
        { creator: userId }
      ]
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    res.json({ character });

  } catch (error) {
    console.error("❌ GET CHARACTER ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch character",
      error: error.message
    });
  }
};

// Update character
export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const character = await Character.findOne({
      _id: id,
      creator: userId
    });

    if (!character) {
      return res.status(404).json({ 
        message: "Character not found or you don't have permission to edit it" 
      });
    }

    const updatedCharacter = await Character.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Character updated successfully",
      character: updatedCharacter
    });

  } catch (error) {
    console.error("❌ UPDATE CHARACTER ERROR:", error);
    res.status(500).json({
      message: "Failed to update character",
      error: error.message
    });
  }
};

// Delete character
export const deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const character = await Character.findOne({
      _id: id,
      creator: userId
    });

    if (!character) {
      return res.status(404).json({ 
        message: "Character not found or you don't have permission to delete it" 
      });
    }

    await Character.findByIdAndDelete(id);

    res.json({ message: "Character deleted successfully" });

  } catch (error) {
    console.error("❌ DELETE CHARACTER ERROR:", error);
    res.status(500).json({
      message: "Failed to delete character",
      error: error.message
    });
  }
};