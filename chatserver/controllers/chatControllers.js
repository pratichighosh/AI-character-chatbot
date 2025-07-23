// controllers/chatControllers.js - FIXED SYNTAX AND DEPLOYMENT READY
import { Chat } from "../models/Chat.js";
import { Conversation } from "../models/Conversation.js";
import { Character } from "../models/Character.js";

console.log('🤖 Enhanced Chat Controller Loading...');

// Enhanced AI Response Generation with realistic character support
const generateResponse = async (userMessage, characterId = null) => {
  console.log('🤖 Generating realistic response for:', userMessage);
  console.log('🎭 Character ID:', characterId || 'None');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  let finalPrompt = userMessage;
  let characterName = "AI Assistant";
  let conversationContext = "";

  // Handle character-based prompts for realistic responses
  if (characterId) {
    try {
      const character = await Character.findById(characterId);
      if (character) {
        characterName = character.name;
        
        // Enhanced context for more realistic responses
        conversationContext = `You are having a natural conversation as ${character.name}. The user just said: "${userMessage}"

${character.systemPrompt}

ENHANCED REALISM INSTRUCTIONS:
- Respond as ${character.name} would ACTUALLY speak in real life
- Use your authentic knowledge, memories, and perspectives as ${character.name}
- Reference your real experiences, work, and background naturally when relevant
- Show your personality through word choice, tone, and conversation style
- If speaking in Hindi/Bengali, use proper script and natural expressions
- Don't be overly formal unless that's your character - be authentically yourself
- React to the user's message in a way that shows you're listening and engaged

User's message: ${userMessage}

${character.name}'s response:`;

        finalPrompt = conversationContext;
        
        // Update character usage
        await Character.findByIdAndUpdate(characterId, { 
          $inc: { usageCount: 1 } 
        });
      }
    } catch (error) {
      console.error('Character fetch error:', error);
    }
  } else {
    // Enhanced regular AI prompt
    finalPrompt = `You are a helpful, knowledgeable AI assistant. Respond naturally and conversationally to: "${userMessage}"

LANGUAGE SUPPORT:
- Respond in English primarily
- If the user writes in Hindi (Devanagari) or Bengali, respond naturally in that language
- Use proper grammar and natural expressions for each language
- You can mix languages naturally if appropriate (like Hinglish)

User: ${userMessage}

Response:`;
  }

  // Try Gemini models with enhanced settings for realistic responses
  const models = ['gemini-1.5-flash', 'gemini-pro'];
  
  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: { 
            temperature: 0.8, // Slightly higher for more natural responses
            maxOutputTokens: 1024,
            topP: 0.95, // For more natural language generation
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
          // Clean up response to ensure it's speech-only
          text = text
            .replace(/^\*[^*]*\*/g, '') // Remove action descriptions at start
            .replace(/\*[^*]*\*/g, '') // Remove any action descriptions
            .replace(/^\([^)]*\)/g, '') // Remove parenthetical descriptions at start
            .replace(/\([^)]*\)/g, '') // Remove any parenthetical descriptions
            .replace(/^\[[^\]]*\]/g, '') // Remove stage directions at start
            .replace(/\[[^\]]*\]/g, '') // Remove any stage directions
            .replace(/^[^:]*:\s*/, '') // Remove "Character:" prefix if present
            .trim();
          
          return {
            text: text,
            characterUsed: characterName,
            model: model
          };
        }
      } else {
        console.error(`${model} HTTP error:`, response.status, await response.text());
      }
    } catch (error) {
      console.error(`${model} error:`, error.message);
    }
  }

  throw new Error('All AI models failed to generate response');
};

// Create new chat
export const createChat = async (req, res) => {
  try {
    console.log("📝 Creating new chat...");
    
    const userId = req.user._id;
    const { characterId, title } = req.body;

    const chatData = {
      user: userId,
      latestMessage: "New Chat",
      title: title || "New Chat"
    };

    if (characterId) {
      chatData.character = characterId;
      
      try {
        const character = await Character.findById(characterId);
        if (character) {
          chatData.title = title || `Chat with ${character.name}`;
        }
      } catch (error) {
        console.error('Character lookup error:', error);
      }
    }

    const chat = await Chat.create(chatData);
    
    res.status(201).json({
      message: "Chat created successfully",
      chat: chat,
      chatId: chat._id
    });

  } catch (error) {
    console.error("❌ Create chat error:", error);
    res.status(500).json({
      message: "Failed to create chat",
      error: error.message
    });
  }
};

// Get all chats
export const getAllChats = async (req, res) => {
  try {
    console.log("📚 Fetching all chats...");
    
    const userId = req.user._id;
    
    const chats = await Chat.find({ user: userId })
      .populate('character', 'name avatar description personality speakingStyle')
      .sort({ updatedAt: -1 });
    
    console.log(`✅ Found ${chats.length} chats`);

    res.json({
      chats: chats,
      count: chats.length
    });

  } catch (error) {
    console.error("❌ Get chats error:", error);
    res.status(500).json({
      message: "Failed to fetch chats",
      error: error.message
    });
  }
};

// Add conversation with enhanced character response
export const addConversation = async (req, res) => {
  try {
    console.log("💬 Adding conversation with enhanced character support...");
    
    const { question, characterId } = req.body;
    const chatId = req.params.id;
    const userId = req.user._id;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Find chat with character information
    const chat = await Chat.findOne({ _id: chatId, user: userId })
      .populate('character');
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Use character from request or chat
    const useCharacterId = characterId || chat.character?._id;
    console.log(`🎭 Using character: ${useCharacterId ? 'Yes' : 'No'}`);

    try {
      // Generate enhanced AI response
      const aiResult = await generateResponse(question.trim(), useCharacterId);
      
      console.log(`✅ Generated response from: ${aiResult.characterUsed}`);
      
      // Save conversation
      const conversation = await Conversation.create({
        chat: chatId,
        question: question.trim(),
        answer: aiResult.text,
      });

      // Update chat with better preview
      const previewLength = 60;
      const questionPreview = question.length > previewLength 
        ? question.substring(0, previewLength) + "..." 
        : question;

      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: questionPreview,
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
      console.error("AI error:", aiError);
      
      // Fallback response
      const fallbackMessage = chat.character 
        ? `I apologize, but I'm having trouble generating a response as ${chat.character.name}. Please try again.`
        : "I'm having trouble generating a response. Please try again.";
      
      const conversation = await Conversation.create({
        chat: chatId,
        question: question.trim(),
        answer: fallbackMessage,
      });

      res.status(201).json({
        message: "Message saved with fallback",
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
    console.error("❌ Add conversation error:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: error.message
    });
  }
};

// Get conversations with character context
export const getConversation = async (req, res) => {
  try {
    console.log("💬 Getting conversations...");
    
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findOne({ _id: chatId, user: userId })
      .populate('character', 'name avatar description personality speakingStyle primaryLanguage expertise');
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const conversations = await Conversation.find({ chat: chatId })
      .sort({ createdAt: 1 });

    res.json({
      conversations: conversations,
      count: conversations.length,
      chatInfo: {
        character: chat.character,
        title: chat.title,
        chatType: chat.character ? 'character' : 'regular'
      }
    });

  } catch (error) {
    console.error("❌ Get conversations error:", error);
    res.status(500).json({
      message: "Failed to fetch conversations",
      error: error.message
    });
  }
};

// Delete chat
export const deleteChat = async (req, res) => {
  try {
    console.log("🗑️ Deleting chat...");
    
    const chatId = req.params.id;
    const userId = req.user._id;

    const chat = await Chat.findOne({ _id: chatId, user: userId });
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Delete all conversations first
    await Conversation.deleteMany({ chat: chatId });
    
    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.json({ 
      message: "Chat deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete chat error:", error);
    res.status(500).json({
      message: "Failed to delete chat",
      error: error.message
    });
  }
};

export { generateResponse };