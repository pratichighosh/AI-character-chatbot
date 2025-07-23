// FIXED controllers/chatControllers.js - CHARACTER SUPPORT ADDED
import { Chat } from "../models/Chat.js";
import { Conversation } from "../models/Conversation.js";
import { Character } from "../models/Character.js";
import { createDefaultCharacters } from "./characterControllers.js";

console.log('🤖 Initializing FREE TIER Gemini Chat Controller WITH CHARACTER SUPPORT');
console.log('🔑 API Key configured:', !!process.env.GEMINI_API_KEY);

// ==========================================
// ENHANCED GEMINI API WITH CHARACTER SUPPORT
// ==========================================
// ADD this function to your controllers/chatControllers.js (before generateResponse function)

const filterResponseToSpeechOnly = (text) => {
  if (!text) return text;
  
  // Remove common narrative patterns
  let cleaned = text
    // Remove text in parentheses like "(Einstein smiles)" 
    .replace(/\([^)]*\)/g, '')
    // Remove text in asterisks like "*nods thoughtfully*"
    .replace(/\*[^*]*\*/g, '')
    // Remove text in square brackets like "[gestures]"
    .replace(/\[[^\]]*\]/g, '')
    // Remove stage direction patterns
    .replace(/^[A-Z][a-z]+ (nods|smiles|gestures|looks|speaks|says)[^.]*\./gm, '')
    // Remove narrative beginnings like "Einstein thoughtfully considers..."
    .replace(/^[A-Z][a-z]+ (thoughtfully|carefully|slowly|quietly) [a-z]+[^.]*\./gm, '')
    // Remove action descriptions that end sentences
    .replace(/,\s*(nodding|smiling|gesturing)[^.]*\./g, '.')
    // Clean up extra spaces and newlines
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    // Remove empty lines
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return cleaned;
};

// ALSO UPDATE the generateResponse function to use this filter: 
// REPLACE the generateResponse function in controllers/chatControllers.js

const generateResponse = async (userMessage, characterId = null) => {
  console.log('🤖 === GENERATING AI RESPONSE ===');
  console.log('📝 User message:', userMessage);
  console.log('🎭 Character ID:', characterId || 'Regular AI');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No API key found');
    throw new Error('Gemini API key not configured');
  }

  let finalPrompt = userMessage;
  let characterName = "AI Assistant";

  // FETCH CHARACTER IF PROVIDED
  if (characterId) {
    try {
      const character = await Character.findById(characterId);
      if (character) {
        console.log(`🎭 Using character: ${character.name}`);
        characterName = character.name;
        
        // CREATE CHARACTER-SPECIFIC PROMPT WITH SPEECH-ONLY INSTRUCTION
        finalPrompt = `${character.systemPrompt}

ADDITIONAL INSTRUCTION: Respond ONLY with direct speech. No action descriptions, no narrative text, no stage directions.

User: ${userMessage}

${character.name}:`;

        console.log('🎭 Character prompt created for:', character.name);
        
        // INCREMENT CHARACTER USAGE
        await Character.findByIdAndUpdate(characterId, { 
          $inc: { usageCount: 1 } 
        });
      } else {
        console.log('⚠️ Character not found, using regular AI');
      }
    } catch (error) {
      console.error('❌ Error fetching character:', error);
      console.log('⚠️ Falling back to regular AI');
    }
  } else {
    // Add speech-only instruction for regular AI too
    finalPrompt = `You are a helpful AI assistant. Respond naturally and conversationally.

IMPORTANT: Respond ONLY with your direct speech. Do not include any action descriptions, stage directions, or narrative text.

User: ${userMessage}
${character.name}:`;

        console.log('🎭 Character prompt created for:', character.name);
        
        // INCREMENT CHARACTER USAGE
        await Character.findByIdAndUpdate(characterId, { 
          $inc: { usageCount: 1 } 
        });
      } else {
        console.log('⚠️ Character not found, using regular AI');
      }
    } catch (error) {
      console.error('❌ Error fetching character:', error);
      console.log('⚠️ Falling back to regular AI');
    }
  }

  console.log('📤 Final prompt length:', finalPrompt.length);

  // FREE TIER COMPATIBLE MODELS
  const freeModels = [
    'gemini-1.5-flash',
    'gemini-pro',
    'gemini-1.0-pro'
  ];

  for (const modelName of freeModels) {
    try {
      console.log(`🔧 Trying model: ${modelName}`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: finalPrompt
          }]
        }],
        generationConfig: {
          temperature: characterId ? 0.9 : 0.7, // More creative for characters
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${apiUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${modelName} error:`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || text.trim().length === 0) {
        console.error(`❌ No text content in ${modelName} response`);
        continue;
      }

      console.log(`✅ SUCCESS with ${modelName}`);
      console.log(`🎭 Response as: ${characterName}`);
      console.log('📝 Response preview:', text.substring(0, 100) + '...');
      
      return {
        text: text,
        characterUsed: characterName,
        model: modelName
      };

    } catch (error) {
      console.error(`❌ ${modelName} error:`, error.message);
      continue;
    }
  }

  throw new Error('All AI models failed');
};

// Create new chat (ENHANCED)
export const createChat = async (req, res) => {
  try {
    console.log("📝 CREATE CHAT - Starting...");
    
    const userId = req.user._id;
    const { characterId, title } = req.body;
    
    console.log(`➕ Creating chat for user: ${userId}`);
    console.log(`🎭 Character ID: ${characterId || 'None (Regular AI)'}`);

    // Prepare chat data
    const chatData = {
      user: userId,
      latestMessage: "New Chat",
    };

    // Add character if provided
    if (characterId) {
      chatData.character = characterId;
      
      // Try to get character name for title
      try {
        const character = await Character.findById(characterId);
        if (character) {
          chatData.title = title || `Chat with ${character.name}`;
          chatData.metadata = {
            characterName: character.name
          };
          console.log(`🎭 Character chat with: ${character.name}`);
        }
      } catch (error) {
        console.error('Error fetching character for title:', error);
        chatData.title = title || "Character Chat";
      }
    } else {
      chatData.title = title || "New Chat";
    }

    const chat = await Chat.create(chatData);
    console.log(`✅ Chat created: ${chat._id}`);

    // Create default characters for new users
    if (!characterId) {
      try {
        await createDefaultCharacters(userId);
      } catch (error) {
        console.log('⚠️ Default characters creation failed:', error.message);
      }
    }

    res.status(201).json({
      message: "Chat created successfully",
      chat: chat,
      chatId: chat._id
    });

  } catch (error) {
    console.error("❌ CREATE CHAT ERROR:", error);
    res.status(500).json({
      message: "Failed to create chat",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get all chats for user (ENHANCED)
export const getAllChats = async (req, res) => {
  try {
    console.log("📚 GET ALL CHATS - Starting...");
    
    const userId = req.user._id;
    console.log(`📚 Fetching chats for user: ${userId}`);

    const chats = await Chat.find({ user: userId })
      .populate('character', 'name avatar description')
      .sort({ updatedAt: -1 });
    
    console.log(`✅ Found ${chats.length} chats`);

    res.json({
      chats: chats,
      count: chats.length
    });

  } catch (error) {
    console.error("❌ GET ALL CHATS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch chats",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Add conversation to chat (ENHANCED WITH CHARACTER SUPPORT)
export const addConversation = async (req, res) => {
  try {
    console.log("💬 ADD CONVERSATION - Starting...");
    
    const { question, characterId } = req.body;
    const chatId = req.params.id;
    const userId = req.user._id;

    console.log(`💬 Chat: ${chatId}`);
    console.log(`📝 Question: ${question}`);
    console.log(`🎭 Character ID: ${characterId || 'None'}`);

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Find chat and verify ownership
    const chat = await Chat.findOne({ _id: chatId, user: userId })
      .populate('character', 'name avatar systemPrompt');
    
    if (!chat) {
      console.log(`❌ Chat not found: ${chatId}`);
      return res.status(404).json({ message: "Chat not found" });
    }

    // Determine which character to use
    let useCharacterId = characterId || chat.character?._id;
    
    console.log(`🎭 Using character: ${useCharacterId ? 'Yes' : 'No'}`);

    try {
      console.log("🤖 Generating AI response...");
      
      // ENHANCED: Generate response with character support
      const aiResult = await generateResponse(question.trim(), useCharacterId);
      
      console.log("✅ AI response generated successfully");
      console.log(`🎭 Response from: ${aiResult.characterUsed}`);
      
      // Create conversation entry
      const conversation = await Conversation.create({
        chat: chatId,
        question: question.trim(),
        answer: aiResult.text,
      });

      // Update chat's latest message
      const latestMessage = question.length > 50 ? 
        question.substring(0, 50) + "..." : 
        question;

      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: latestMessage,
        updatedAt: new Date(),
        $inc: { messageCount: 1 }
      });

      res.status(201).json({
        message: "Message sent successfully",
        _id: conversation._id,
        chat: conversation.chat,
        question: conversation.question,
        answer: conversation.answer,
        createdAt: conversation.createdAt,
        characterUsed: aiResult.characterUsed,
        model: aiResult.model
      });

    } catch (aiError) {
      console.error("❌ AI generation failed:", aiError.message);
      
      // Provide helpful user-facing error messages
      let fallbackResponse;
      if (aiError.message.includes('All AI models failed')) {
        fallbackResponse = "🔄 AI Service Temporarily Unavailable: I'm having technical difficulties. Please try again in a moment.";
      } else {
        fallbackResponse = "⚡ I'm having trouble generating a response right now. Please try again.";
      }

      // Save conversation with fallback response
      const conversation = await Conversation.create({
        chat: chatId,
        question: question.trim(),
        answer: fallbackResponse,
      });

      res.status(201).json({
        message: "Message saved with fallback response",
        _id: conversation._id,
        chat: conversation.chat,
        question: conversation.question,
        answer: conversation.answer,
        createdAt: conversation.createdAt,
        characterUsed: chat.character?.name || "AI Assistant",
        isError: true
      });
    }

  } catch (error) {
    console.error("❌ ADD CONVERSATION ERROR:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Get conversations for a chat (ENHANCED)
export const getConversation = async (req, res) => {
  try {
    console.log("💬 GET CONVERSATION - Starting...");
    
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findOne({ _id: chatId, user: userId })
      .populate('character', 'name avatar description');
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const conversations = await Conversation.find({ chat: chatId })
      .sort({ createdAt: 1 });

    console.log(`✅ Found ${conversations.length} conversations`);

    res.json({
      conversations: conversations,
      count: conversations.length,
      chatInfo: {
        character: chat.character,
        title: chat.title,
        chatType: chat.chatType
      }
    });

  } catch (error) {
    console.error("❌ GET CONVERSATION ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch conversations",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

// Delete chat and all its conversations
export const deleteChat = async (req, res) => {
  try {
    console.log("🗑️ DELETE CHAT - Starting...");
    
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findOne({ _id: chatId, user: userId });
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const deletedConversations = await Conversation.deleteMany({ chat: chatId });
    console.log(`🗑️ Deleted ${deletedConversations.deletedCount} conversations`);
    
    await Chat.findByIdAndDelete(chatId);
    console.log(`✅ Chat deleted: ${chatId}`);

    res.json({ 
      message: "Chat deleted successfully",
      deletedConversations: deletedConversations.deletedCount
    });

  } catch (error) {
    console.error("❌ DELETE CHAT ERROR:", error);
    res.status(500).json({
      message: "Failed to delete chat",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

export { generateResponse };