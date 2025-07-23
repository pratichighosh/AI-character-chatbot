// models/Chat.js - COMPLETE REPLACEMENT
// Supports both regular AI chat and character-based chat

import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    
    // NEW: Character support (null = regular AI, ObjectId = character chat)
    character: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Character",
      default: null, // null means regular AI assistant
      validate: {
        validator: function(v) {
          // Allow null or valid ObjectId
          return v === null || mongoose.Types.ObjectId.isValid(v);
        },
        message: "Character must be a valid ObjectId or null"
      }
    },
    
    // Chat title/name (auto-generated based on type)
    title: {
      type: String,
      default: function() {
        return this.character ? "Character Chat" : "New Chat";
      },
      maxlength: [100, "Title too long"],
      trim: true
    },
    
    latestMessage: {
      type: String,
      default: "New Chat",
      maxlength: [200, "Latest message too long"],
      trim: true
    },
    
    // Chat type for easy filtering
    chatType: {
      type: String,
      enum: ["regular", "character"],
      default: function() {
        return this.character ? "character" : "regular";
      }
    },
    
    // Message count for analytics
    messageCount: {
      type: Number,
      default: 0,
      min: [0, "Message count cannot be negative"]
    },
    
    // Chat status
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Metadata for different chat types
    metadata: {
      characterName: { type: String }, // Cache character name for performance
      lastCharacterUsed: { type: Date }, // Track when character was last used
      userPreferences: {
        temperature: { type: Number, min: 0, max: 1, default: 0.7 },
        maxTokens: { type: Number, min: 100, max: 2048, default: 1024 }
      }
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

// Existing index for user queries
chatSchema.index({ user: 1, updatedAt: -1 });

// New indexes for character functionality
chatSchema.index({ user: 1, chatType: 1, updatedAt: -1 }); // Filter by chat type
chatSchema.index({ character: 1, updatedAt: -1 }); // Character usage analytics
chatSchema.index({ user: 1, character: 1 }); // User's chats with specific character

// ==========================================
// VIRTUAL FIELDS
// ==========================================

// Virtual field to check if this is a character chat
chatSchema.virtual('isCharacterChat').get(function() {
  return this.character !== null;
});

// Virtual field to get chat display name
chatSchema.virtual('displayName').get(function() {
  if (this.character && this.metadata?.characterName) {
    return `Chat with ${this.metadata.characterName}`;
  }
  return this.title || "New Chat";
});

// ==========================================
// MIDDLEWARE (HOOKS)
// ==========================================

// Pre-save middleware to update metadata
chatSchema.pre('save', async function(next) {
  try {
    // Update chat type based on character
    this.chatType = this.character ? "character" : "regular";
    
    // Update title if not manually set
    if (this.isNew || this.isModified('character')) {
      if (this.character) {
        // Try to get character name for title
        try {
          const Character = mongoose.model('Character');
          const character = await Character.findById(this.character).select('name');
          if (character) {
            this.title = `Chat with ${character.name}`;
            this.metadata.characterName = character.name;
            this.metadata.lastCharacterUsed = new Date();
          }
        } catch (error) {
          console.error('Error fetching character for chat title:', error);
          this.title = "Character Chat";
        }
      } else {
        this.title = "New Chat";
        this.metadata.characterName = undefined;
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// STATIC METHODS
// ==========================================

// Get user's regular chats
chatSchema.statics.getRegularChats = function(userId, limit = 20) {
  return this.find({ 
    user: userId, 
    chatType: "regular",
    isActive: true 
  })
  .sort({ updatedAt: -1 })
  .limit(limit);
};

// Get user's character chats
chatSchema.statics.getCharacterChats = function(userId, limit = 20) {
  return this.find({ 
    user: userId, 
    chatType: "character",
    isActive: true 
  })
  .populate('character', 'name avatar description')
  .sort({ updatedAt: -1 })
  .limit(limit);
};

// Get all chats for user (mixed)
chatSchema.statics.getAllUserChats = function(userId, limit = 20) {
  return this.find({ 
    user: userId,
    isActive: true 
  })
  .populate('character', 'name avatar description')
  .sort({ updatedAt: -1 })
  .limit(limit);
};

// Get user's chats with specific character
chatSchema.statics.getChatsWithCharacter = function(userId, characterId) {
  return this.find({ 
    user: userId, 
    character: characterId,
    isActive: true 
  })
  .sort({ updatedAt: -1 });
};

// ==========================================
// INSTANCE METHODS
// ==========================================

// Method to increment message count
chatSchema.methods.incrementMessageCount = function() {
  this.messageCount += 1;
  return this.save();
};

// Method to update latest message
chatSchema.methods.updateLatestMessage = function(message) {
  this.latestMessage = message.length > 200 ? 
    message.substring(0, 197) + "..." : 
    message;
  this.updatedAt = new Date();
  return this.save();
};

// Method to switch character (for existing chat)
chatSchema.methods.switchCharacter = async function(newCharacterId) {
  this.character = newCharacterId;
  if (newCharacterId) {
    try {
      const Character = mongoose.model('Character');
      const character = await Character.findById(newCharacterId).select('name');
      if (character) {
        this.title = `Chat with ${character.name}`;
        this.metadata.characterName = character.name;
        this.metadata.lastCharacterUsed = new Date();
      }
    } catch (error) {
      console.error('Error switching character:', error);
    }
  } else {
    this.title = "New Chat";
    this.metadata.characterName = undefined;
  }
  return this.save();
};

// ==========================================
// VALIDATION
// ==========================================

// Custom validation to ensure character exists if provided
chatSchema.pre('validate', async function(next) {
  if (this.character && this.isModified('character')) {
    try {
      const Character = mongoose.model('Character');
      const characterExists = await Character.findById(this.character);
      if (!characterExists) {
        return next(new Error('Referenced character does not exist'));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// ==========================================
// EXPORT MODEL
// ==========================================

export const Chat = mongoose.model("Chat", chatSchema);