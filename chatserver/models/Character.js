// models/Character.js - FIXED SYSTEMPROMPT GENERATION
import mongoose from "mongoose";

const personalityTraits = [
  "Wise and thoughtful",
  "Curious and inquisitive", 
  "Caring and nurturing",
  "Confident and assertive",
  "Humorous and playful",
  "Serious and focused",
  "Creative and artistic",
  "Analytical and logical",
  "Passionate and energetic",
  "Calm and peaceful",
  "Mysterious and enigmatic",
  "Friendly and outgoing",
  "Reserved and introspective",
  "Adventurous and bold",
  "Patient and understanding"
];

const speakingStyles = [
  "Formal and professional",
  "Casual and friendly", 
  "Poetic and metaphorical",
  "Direct and straightforward",
  "Warm and gentle",
  "Witty and clever",
  "Scientific and precise",
  "Storytelling and narrative",
  "Philosophical and deep",
  "Encouraging and supportive",
  "Playful and teasing",
  "Authoritative and commanding",
  "Humble and modest",
  "Dramatic and expressive",
  "Simple and clear"
];

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Character name is required"],
      trim: true,
      maxlength: [50, "Character name too long"],
      minlength: [1, "Character name cannot be empty"]
    },
    
    description: {
      type: String,
      required: [true, "Character description is required"],
      trim: true,
      maxlength: [500, "Description too long"],
      minlength: [10, "Description too short"]
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
      maxlength: [500, "Background too long"],
      default: ""
    },
    
    primaryLanguage: {
      type: String,
      enum: ['english', 'hindi', 'bengali', 'multilingual'],
      default: 'english'
    },
    
    expertise: [{
      type: String,
      trim: true,
      maxlength: [50, "Expertise area too long"]
    }],
    
    responseStyle: {
      type: String,
      enum: ['conversational', 'educational', 'supportive', 'analytical', 'creative', 'advisory'],
      default: 'conversational'
    },
    
    systemPrompt: {
      type: String,
      required: true,
      default: function() {
        return generateSystemPrompt(this);
      }
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
      enum: {
        values: ['assistant', 'friend', 'professional', 'creative', 'educational', 'entertainment', 'historical', 'fictional', 'custom'],
        message: "Invalid category"
      },
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

// Indexes for performance
characterSchema.index({ creator: 1, createdAt: -1 });
characterSchema.index({ isPublic: 1, category: 1, usageCount: -1 });
characterSchema.index({ name: "text", description: "text" });

// Function to generate system prompt
function generateSystemPrompt(character) {
  console.log(`🎭 Generating system prompt for: ${character.name}`);
  
  // Language instructions
  let languageInstructions = "";
  switch(character.primaryLanguage) {
    case 'hindi':
      languageInstructions = `
- You can respond in Hindi (Devanagari script) when appropriate or requested
- Use proper Hindi grammar and vocabulary naturally
- Mix Hindi and English naturally as native speakers do (Hinglish) when suitable`;
      break;
    case 'bengali':
      languageInstructions = `
- You can respond in Bengali (Bengali script) when appropriate or requested  
- Use proper Bengali grammar and vocabulary naturally
- Mix Bengali and English naturally as native speakers do when suitable`;
      break;
    case 'multilingual':
      languageInstructions = `
- You can respond in English, Hindi (Devanagari), or Bengali (Bengali script) as appropriate
- Switch languages naturally based on context or user preference
- Use proper grammar and vocabulary for each language`;
      break;
    default:
      languageInstructions = `
- Respond primarily in English with proper grammar
- You can use Hindi or Bengali words/phrases when contextually appropriate`;
  }

  // Expertise context
  const expertiseContext = character.expertise && character.expertise.length > 0 
    ? `\nEXPERTISE AREAS: ${character.expertise.join(', ')} - Use your knowledge in these areas naturally when relevant.`
    : '';

  // Response style guidance
  let styleGuidance = "";
  switch(character.responseStyle) {
    case 'educational':
      styleGuidance = "Focus on teaching and explaining concepts clearly.";
      break;
    case 'supportive':
      styleGuidance = "Be encouraging, empathetic and emotionally supportive.";
      break;
    case 'analytical':
      styleGuidance = "Approach topics with logical analysis and critical thinking.";
      break;
    case 'creative':
      styleGuidance = "Be imaginative, artistic and think outside the box.";
      break;
    case 'advisory':
      styleGuidance = "Provide helpful advice and practical guidance.";
      break;
    default:
      styleGuidance = "Maintain natural, engaging conversation.";
  }

  const systemPrompt = `You are ${character.name}. ${character.description}

CORE IDENTITY:
- Personality: ${character.personality}
- Speaking Style: ${character.speakingStyle}
- Background: ${character.background || 'Not specified'}
- Response Approach: ${styleGuidance}${expertiseContext}

LANGUAGE INSTRUCTIONS:${languageInstructions}

CRITICAL RESPONSE RULES:
1. SPEECH ONLY: Respond ONLY with your direct spoken words as ${character.name}
2. NO ACTIONS: Never include descriptions, stage directions, or narrative text
3. NO FORMATTING: Do not use *actions*, (thoughts), [stage directions], or similar
4. BE AUTHENTIC: Fully embody ${character.name}'s personality, background, and speaking style
5. STAY IN CHARACTER: Always respond as ${character.name} would genuinely speak
6. NATURAL CONVERSATION: Engage naturally without breaking character

WRONG EXAMPLES:
❌ "*${character.name} smiles thoughtfully* Well, my friend..."
❌ "(adjusts glasses) The theory of relativity is..."
❌ "[${character.name} gestures excitedly] Time and space are..."

CORRECT EXAMPLES:
✅ "Well, my friend, time is not what most people think..."
✅ "The theory of relativity shows us that time and space are connected..."
✅ "You know, when I was working on this problem..."

Remember: You ARE ${character.name}. Speak naturally as this person would, using their knowledge, personality, and speaking patterns, but ONLY provide spoken dialogue.`;

  console.log(`✅ System prompt generated for ${character.name} (${systemPrompt.length} characters)`);
  return systemPrompt;
}

// FIXED: Pre-save middleware to generate system prompt
characterSchema.pre('save', function(next) {
  console.log(`🎭 Pre-save middleware triggered for: ${this.name}`);
  
  // Always generate system prompt if it's new or if key fields changed
  if (this.isNew || this.isModified(['name', 'description', 'personality', 'speakingStyle', 'background', 'primaryLanguage', 'expertise', 'responseStyle']) || !this.systemPrompt) {
    try {
      this.systemPrompt = generateSystemPrompt(this);
      console.log(`✅ System prompt set for ${this.name}`);
    } catch (error) {
      console.error(`❌ Error generating system prompt for ${this.name}:`, error);
      // Fallback basic prompt
      this.systemPrompt = `You are ${this.name}. ${this.description}

Personality: ${this.personality}
Speaking Style: ${this.speakingStyle}

CRITICAL: Respond ONLY with your spoken words as ${this.name}. Do not include any action descriptions or stage directions.

User message: `;
      console.log(`⚠️ Using fallback system prompt for ${this.name}`);
    }
  }
  
  next();
});

// Static methods for getting predefined options
characterSchema.statics.getPersonalityTraits = function() {
  return personalityTraits;
};

characterSchema.statics.getSpeakingStyles = function() {
  return speakingStyles;
};

// Method to regenerate system prompt
characterSchema.methods.regenerateSystemPrompt = function() {
  this.systemPrompt = generateSystemPrompt(this);
  return this.systemPrompt;
};

export const Character = mongoose.model("Character", characterSchema);