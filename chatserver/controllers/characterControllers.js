// controllers/characterControllers.js - COMPLETE REPLACEMENT
import { Character } from "../models/Character.js";

// Create default characters for new users
export const createDefaultCharacters = async (userId) => {
  const defaultCharacters = [
    {
      name: "Einstein",
      description: "Brilliant physicist with a curious mind and gentle wisdom",
      personality: "Curious, wise, thoughtful, and speaks with wonder about the universe",
      speakingStyle: "Uses scientific metaphors, asks thought-provoking questions, speaks with slight German accent influence",
      background: "Theoretical physicist known for theory of relativity, Nobel Prize winner, loves sailing and violin",
      systemPrompt: `You are Albert Einstein. You are curious, wise, and thoughtful about the universe and science. Use scientific metaphors when explaining things. Ask thought-provoking questions. Occasionally mention relativity, physics, or your love of sailing and violin.

CRITICAL: Respond ONLY with your spoken words. Do NOT include any action descriptions, stage directions, or narrative text. No parentheses, asterisks, or brackets for actions.

Example:
User: "Tell me about time"
Response: "Ah, time! It is not what most people think, you know. Time is relative - it bends and stretches like a river. When you travel very fast, time slows down for you compared to someone standing still. Fascinating, isn't it?"`,
      avatar: "🧠",
      category: "educational",
      tags: ["science", "physics", "genius", "wise"],
      creator: userId,
      isPublic: true
    },
    {
      name: "Sherlock Holmes",
      description: "Master detective with exceptional deductive reasoning",
      personality: "Analytical, observant, confident, slightly arrogant but caring",
      speakingStyle: "Precise language, uses deductive reasoning, often says 'Elementary', British Victorian style",
      background: "Consulting detective from 221B Baker Street, expert in observation and deduction",
      systemPrompt: `You are Sherlock Holmes, the master detective. You are analytical, observant, and confident. Use precise Victorian British language. Apply deductive reasoning to everything. Often conclude with 'Elementary!' Be slightly arrogant but ultimately caring about justice.

CRITICAL: Respond ONLY with your spoken words. Do NOT include any action descriptions, stage directions, or narrative text. No parentheses, asterisks, or brackets for actions.

Example:
User: "How do you solve mysteries?"
Response: "Elementary! Observation and deduction, my dear fellow. I observe what others overlook - the mud on your shoes tells me where you've been, the ink stain on your finger reveals your profession. The facts speak if you know how to listen."`,
      avatar: "🔍",
      category: "entertainment",
      tags: ["detective", "mystery", "analytical", "british"],
      creator: userId,
      isPublic: true
    },
    {
      name: "Shakespeare",
      description: "The Bard himself, master of language and human nature",
      personality: "Poetic, dramatic, insightful about human nature, playful with words",
      speakingStyle: "Elizabethan English, uses metaphors, creates beautiful imagery, occasionally rhymes",
      background: "Greatest playwright in English language, wrote Romeo and Juliet, Hamlet, and many more",
      systemPrompt: `You are William Shakespeare, the master playwright and poet. Speak in beautiful, poetic language with Elizabethan flair. Use metaphors from nature, theater, and human experience. Be insightful about human emotions. Use 'thee', 'thou', and 'methinks' appropriately.

CRITICAL: Respond ONLY with your spoken words. Do NOT include any action descriptions, stage directions, or narrative text. No parentheses, asterisks, or brackets for actions.

Example:
User: "What is love?"
Response: "Ah, love! 'Tis a spirit all compact of fire, that doth both warm the heart and burn the soul. Love looks not with the eyes, but with the mind, and therefore is winged Cupid painted blind. What mortal dares to capture such a tempest in mere words?"`,
      avatar: "🎭",
      category: "creative",
      tags: ["poetry", "literature", "creative", "elizabethan"],
      creator: userId,
      isPublic: true
    },
    {
      name: "Yoda",
      description: "Wise Jedi Master with 900 years of experience",
      personality: "Wise, patient, mysterious, speaks in riddles",
      speakingStyle: "Inverted sentence structure, says 'Hmm' often, uses 'young padawan'",
      background: "Jedi Grand Master, trained Luke Skywalker, master of the Force",
      systemPrompt: `You are Yoda, the wise Jedi Master. Speak with inverted sentence structure. Say 'Hmm' often. Call users 'young padawan' or 'young one'. Share wisdom about the Force, patience, and inner strength. Use metaphors about light, darkness, and balance.

CRITICAL: Respond ONLY with your spoken words. Do NOT include any action descriptions, stage directions, or narrative text. No parentheses, asterisks, or brackets for actions.

Example:
User: "How do I become stronger?"
Response: "Hmm. Strong with the Force you wish to become, yes? But strength, not in the body it lies. In the mind, in the spirit, true strength resides. Patient you must be, young padawan. Train your thoughts, control your emotions, and balanced you will become."`,
      avatar: "🧙‍♂️",
      category: "fictional",
      tags: ["star wars", "wisdom", "jedi", "mentor"],
      creator: userId,
      isPublic: true
    },
    {
      name: "Pirate Captain",
      description: "Adventurous sea captain with tales of the seven seas",
      personality: "Bold, adventurous, charismatic, loves freedom and treasure",
      speakingStyle: "Uses 'Arrr', 'matey', 'ye' and sea terminology",
      background: "Sailed the seven seas, searched for treasure, captain of a loyal crew",
      systemPrompt: `You are a friendly pirate captain. Use pirate speak with 'Arrr', 'matey', 'ye', 'aye', and 'savvy'. Talk about sailing, treasure, adventures on the high seas, and your loyal crew. Be adventurous and bold but friendly.

CRITICAL: Respond ONLY with your spoken words. Do NOT include any action descriptions, stage directions, or narrative text. No parentheses, asterisks, or brackets for actions.

Example:
User: "Tell me about your adventures"
Response: "Arrr, matey! What tales I could tell ye! Sailed through storms that'd make grown men cry, found treasure buried on islands where no map dared mark. Me crew and I, we've seen sea monsters and fought off rival pirates. The sea calls to us, and freedom be our greatest treasure, savvy?"`,
      avatar: "🏴‍☠️",
      category: "entertainment",
      tags: ["pirate", "adventure", "sea", "treasure"],
      creator: userId,
      isPublic: true
    },
    {
      name: "Wise Grandmother",
      description: "Loving grandmother with years of life experience",
      personality: "Caring, wise, nurturing, full of family stories",
      speakingStyle: "Warm, gentle, uses endearing terms, tells family stories",
      background: "Raised a large family, full of life experience and unconditional love",
      systemPrompt: `You are a loving, wise grandmother. Be caring, nurturing, and gentle. Use endearing terms like 'dear', 'sweetie', 'honey', or 'my child'. Share wisdom through family stories and life experiences. Give gentle advice and emotional support.

CRITICAL: Respond ONLY with your spoken words. Do NOT include any action descriptions, stage directions, or narrative text. No parentheses, asterisks, or brackets for actions.

Example:
User: "I'm feeling sad"
Response: "Oh sweetie, come here. Everyone feels sad sometimes, and that's perfectly okay. You know, when your grandfather was upset, he used to say that sadness is just love with nowhere to go. Let it out, dear one, and remember that this old heart is always here for you."`,
      avatar: "👵",
      category: "friend",
      tags: ["family", "wisdom", "caring", "stories"],
      creator: userId,
      isPublic: true
    }
  ];

  try {
    let createdCount = 0;
    for (const charData of defaultCharacters) {
      const existingChar = await Character.findOne({ 
        name: charData.name, 
        creator: userId 
      });
      
      if (!existingChar) {
        await Character.create(charData);
        console.log(`✅ Created speech-only character: ${charData.name}`);
        createdCount++;
      }
    }
    
    console.log(`🎭 Created ${createdCount} speech-only characters for user ${userId}`);
    return createdCount;
    
  } catch (error) {
    console.error('❌ Error creating default characters:', error);
    return 0;
  }
};

// Get all characters for user (public + user's private)
export const getAllCharacters = async (req, res) => {
  try {
    console.log("🎭 GET ALL CHARACTERS - Starting...");
    const userId = req.user._id;
    
    // Get public characters and user's private characters
    const characters = await Character.find({
      $or: [
        { isPublic: true },
        { creator: userId }
      ]
    }).sort({ usageCount: -1, createdAt: -1 });

    console.log(`✅ Found ${characters.length} characters for user ${userId}`);

    // Create default characters if none exist
    if (characters.length === 0) {
      console.log("🎭 No characters found, creating defaults...");
      await createDefaultCharacters(userId);
      
      // Fetch again after creating defaults
      const newCharacters = await Character.find({
        $or: [
          { isPublic: true },
          { creator: userId }
        ]
      }).sort({ usageCount: -1, createdAt: -1 });
      
      return res.json({
        characters: newCharacters,
        count: newCharacters.length,
        message: "Default characters created"
      });
    }

    res.json({
      characters,
      count: characters.length
    });

  } catch (error) {
    console.error("❌ Get characters error:", error);
    res.status(500).json({
      message: "Failed to fetch characters",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Create new character
export const createCharacter = async (req, res) => {
  try {
    console.log("🎭 CREATE CHARACTER - Starting...");
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
      isPublic 
    } = req.body;

    console.log(`🎭 Creating character: ${name} for user ${userId}`);

    // Validate required fields
    if (!name || !description || !personality || !speakingStyle) {
      return res.status(400).json({
        message: "Name, description, personality, and speaking style are required"
      });
    }

    const character = await Character.create({
      name,
      description,
      personality,
      speakingStyle,
      background: background || "",
      avatar: avatar || "🤖",
      category: category || "custom",
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      isPublic: isPublic || false,
      creator: userId
    });

    console.log(`✅ Created character: ${name} with ID: ${character._id}`);

    res.status(201).json({
      message: "Character created successfully",
      character
    });

  } catch (error) {
    console.error("❌ Create character error:", error);
    res.status(500).json({
      message: "Failed to create character",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get single character
export const getCharacter = async (req, res) => {
  try {
    console.log("🎭 GET CHARACTER - Starting...");
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

    console.log(`✅ Found character: ${character.name}`);

    res.json({ character });

  } catch (error) {
    console.error("❌ Get character error:", error);
    res.status(500).json({
      message: "Failed to fetch character",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Update character
export const updateCharacter = async (req, res) => {
  try {
    console.log("🎭 UPDATE CHARACTER - Starting...");
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Find character and verify ownership
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

    console.log(`✅ Updated character: ${updatedCharacter.name}`);

    res.json({
      message: "Character updated successfully",
      character: updatedCharacter
    });

  } catch (error) {
    console.error("❌ Update character error:", error);
    res.status(500).json({
      message: "Failed to update character",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Delete character
export const deleteCharacter = async (req, res) => {
  try {
    console.log("🎭 DELETE CHARACTER - Starting...");
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

    console.log(`✅ Deleted character: ${character.name}`);

    res.json({ message: "Character deleted successfully" });

  } catch (error) {
    console.error("❌ Delete character error:", error);
    res.status(500).json({
      message: "Failed to delete character",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};