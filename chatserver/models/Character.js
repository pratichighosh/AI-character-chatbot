// models/Character.js - FINAL WORKING VERSION
import mongoose from "mongoose";

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Character name is required"],
      trim: true,
      maxlength: [50, "Character name too long"]
    },
    
    description: {
      type: String,
      required: [true, "Character description is required"],
      trim: true,
      maxlength: [500, "Description too long"]
    },
    
    personality: {
      type: String,
      required: [true, "Character personality is required"],
      trim: true,
      maxlength: [300, "Personality description too long"]
    },
    
    speakingStyle: {
      type: String,
      required: [true, "Speaking style is required"],
      trim: true,
      maxlength: [300, "Speaking style description too long"]
    },
    
    background: {
      type: String,
      trim: true,
      maxlength: [1000, "Background too long"],
      default: ""
    },
    
    primaryLanguage: {
      type: String,
      enum: ['english', 'hindi', 'bengali', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'japanese', 'korean', 'chinese', 'arabic', 'multilingual'],
      default: 'english'
    },
    
    expertise: [{
      type: String,
      trim: true,
      maxlength: [50, "Expertise area too long"]
    }],
    
    responseStyle: {
      type: String,
      enum: ['conversational', 'educational', 'supportive', 'analytical', 'creative', 'professional', 'casual', 'enthusiastic', 'calm', 'humorous', 'philosophical', 'practical'],
      default: 'conversational'
    },
    
    avatar: {
      type: String,
      default: "🤖",
      maxlength: [10, "Avatar too long"]
    },
    
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"]
    },
    
    isPublic: {
      type: Boolean,
      default: false
    },
    
    category: {
      type: String,
      enum: ['assistant', 'friend', 'professional', 'creative', 'educational', 'entertainment', 'historical', 'fictional', 'custom'],
      default: 'custom'
    },
    
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [30, "Tag too long"]
    }],
    
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"]
    },
    
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
characterSchema.index({ creator: 1, createdAt: -1 });
characterSchema.index({ isPublic: 1, category: 1, usageCount: -1 });
characterSchema.index({ name: "text", description: "text" });

export const Character = mongoose.model("Character", characterSchema);