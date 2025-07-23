// FIXED context/ChatContext.jsx - CHARACTER SUPPORT ADDED
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../main";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // EXISTING STATE
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [newRequestLoading, setNewRequestLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [createLod, setCreateLod] = useState(false);
  const [loading, setLoading] = useState(false);

  // CHARACTER STATE
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [characterCreateLoading, setCharacterCreateLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  // FIXED: Enhanced message sending with character support
  async function fetchResponse() {
    if (!prompt || prompt.trim() === "") {
      toast.error("Please enter a message");
      return;
    }
    
    if (!selected) {
      toast.error("Please select a chat or create a new one");
      return;
    }

    const currentPrompt = prompt.trim();
    setNewRequestLoading(true);
    setPrompt("");
    
    try {
      console.log("🤖 Sending message to AI...");
      console.log("📤 Question:", currentPrompt);
      console.log("🎭 Selected Character:", selectedCharacter ? selectedCharacter.name : "Regular AI");
      
      const requestData = {
        question: currentPrompt,
      };

      // FIXED: Add character ID to request
      if (selectedCharacter && selectedCharacter._id) {
        requestData.characterId = selectedCharacter._id;
        console.log("🎭 Sending with character ID:", selectedCharacter._id);
      }

      const response = await axios.post(
        `${server}/api/chat/${selected}`,
        requestData,
        {
          headers: getAuthHeaders(),
        }
      );

      console.log("✅ AI response received");
      console.log("🎭 Response from:", response.data.characterUsed);
      
      const newMessage = {
        question: currentPrompt,
        answer: response.data.answer,
        _id: response.data._id,
        createdAt: response.data.createdAt,
        characterUsed: response.data.characterUsed || (selectedCharacter ? selectedCharacter.name : "AI Assistant")
      };

      setMessages((prev) => [...prev, newMessage]);
      
      // Refresh chats to update latest message
      await fetchChats();
      
    } catch (error) {
      console.error("❌ AI Response error:", error);
      
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        const errorMessage = error.response?.data?.message || "Failed to get AI response";
        toast.error(errorMessage);
      }
    } finally {
      setNewRequestLoading(false);
    }
  }

  // FIXED: Enhanced chat creation with character support
  async function createChat(characterId = null, title = null) {
    setCreateLod(true);
    try {
      console.log("➕ Creating new chat...");
      console.log("🎭 Character ID:", characterId || "Regular AI");
      
      const requestData = {};
      
      if (characterId) {
        requestData.characterId = characterId;
        console.log("🎭 Creating character chat with ID:", characterId);
      }
      
      if (title) {
        requestData.title = title;
      }

      const { data } = await axios.post(
        `${server}/api/chat/new`,
        requestData,
        {
          headers: getAuthHeaders(),
        }
      );

      console.log("✅ New chat created:", data);
      
      const newChat = data.chat || data;
      const chatId = data.chatId || newChat._id;
      
      // Add new chat to state
      setChats((prev) => [newChat, ...prev]);
      
      // Select the new chat
      setSelected(chatId);
      
      // FIXED: Set character based on chat data
      if (newChat.character) {
        setSelectedCharacter(newChat.character);
        console.log("🎭 Character set from chat data:", newChat.character.name);
      } else if (characterId && selectedCharacter) {
        // Keep the selected character if creating character chat
        console.log("🎭 Keeping selected character:", selectedCharacter.name);
      } else {
        setSelectedCharacter(null);
        console.log("🤖 Set to regular AI");
      }
      
      // Clear messages for new chat
      setMessages([]);
      
      const chatTypeText = characterId ? `with ${selectedCharacter?.name || 'character'}` : "(regular AI)";
      toast.success(`New chat created ${chatTypeText}`);
      
    } catch (error) {
      console.error("❌ Create chat error:", error);
      
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        const errorMessage = error.response?.data?.message || "Failed to create new chat";
        toast.error(errorMessage);
      }
    } finally {
      setCreateLod(false);
    }
  }

  // FIXED: Create regular AI chat
  async function createRegularChat() {
    setSelectedCharacter(null);
    await createChat(null, "New Chat");
  }

  // FIXED: Create character chat
  async function createCharacterChat(character) {
    console.log("🎭 Creating character chat with:", character.name);
    setSelectedCharacter(character);
    await createChat(character._id, `Chat with ${character.name}`);
  }

  // Fetch all characters
  async function fetchCharacters() {
    if (charactersLoading) return;
    
    setCharactersLoading(true);
    try {
      console.log("🎭 Fetching characters...");
      
      const { data } = await axios.get(`${server}/api/characters`, {
        headers: getAuthHeaders(),
      });

      console.log("✅ Characters fetched:", data.characters?.length || 0);
      
      const charactersArray = data.characters || [];
      setCharacters(charactersArray);
      
    } catch (error) {
      console.error("❌ Fetch characters error:", error);
      
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else if (error.response?.status === 404) {
        console.log("⚠️ Character system not yet implemented");
        setCharacters([]);
      } else {
        toast.error("Failed to load characters");
      }
    } finally {
      setCharactersLoading(false);
    }
  }

  // Create new character
  async function createCharacter(characterData) {
    setCharacterCreateLoading(true);
    try {
      console.log("🎭 Creating character:", characterData.name);
      
      const { data } = await axios.post(
        `${server}/api/characters`,
        characterData,
        {
          headers: getAuthHeaders(),
        }
      );

      console.log("✅ Character created:", data.character.name);
      
      setCharacters((prev) => [data.character, ...prev]);
      
      toast.success(`Character "${data.character.name}" created successfully!`);
      
      return data.character;
      
    } catch (error) {
      console.error("❌ Create character error:", error);
      
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        const errorMessage = error.response?.data?.message || "Failed to create character";
        toast.error(errorMessage);
      }
      
      throw error;
    } finally {
      setCharacterCreateLoading(false);
    }
  }

  // FIXED: Enhanced fetch chats with character data
  async function fetchChats() {
    try {
      console.log("📚 Fetching user chats...");
      
      const { data } = await axios.get(`${server}/api/chat/all`, {
        headers: getAuthHeaders(),
      });

      console.log("✅ Chats fetched successfully:", data.length || data.chats?.length);
      
      const chatsArray = data.chats || data || [];
      setChats(chatsArray);
      
      // FIXED: Auto-select first chat and set character properly
      if (chatsArray.length > 0 && !selected) {
        const firstChat = chatsArray[0];
        setSelected(firstChat._id);
        
        // Set character based on chat's character
        if (firstChat.character) {
          setSelectedCharacter(firstChat.character);
          console.log("🎭 Auto-selected character:", firstChat.character.name);
        } else {
          setSelectedCharacter(null);
          console.log("🤖 Auto-selected regular AI");
        }
        
        console.log("📌 Auto-selected first chat:", firstChat._id);
      }
      
    } catch (error) {
      console.error("❌ Fetch chats error:", error);
      
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error("Failed to load chats");
      }
    }
  }

  // FIXED: Enhanced fetch messages with character info
  async function fetchMessages() {
    if (!selected) {
      console.log("⚠️ No chat selected");
      return;
    }

    setLoading(true);
    try {
      console.log("💬 Fetching messages for chat:", selected);
      
      const { data } = await axios.get(`${server}/api/chat/${selected}`, {
        headers: getAuthHeaders(),
      });

      console.log("✅ Messages fetched:", data.conversations?.length || data.length);
      
      const messages = data.conversations || data || [];
      setMessages(messages);
      
      // FIXED: Update character based on chat info
      if (data.chatInfo?.character) {
        setSelectedCharacter(data.chatInfo.character);
        console.log("🎭 Character updated from chat info:", data.chatInfo.character.name);
      } else {
        setSelectedCharacter(null);
        console.log("🤖 Chat is regular AI");
      }
      
    } catch (error) {
      console.error("❌ Fetch messages error:", error);
      
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else if (error.response?.status === 404) {
        toast.error("Chat not found");
        setSelected(null);
        setMessages([]);
      } else {
        toast.error("Failed to load messages");
      }
    } finally {
      setLoading(false);
    }
  }

  // Delete chat
  async function deleteChat(id) {
    try {
      console.log("🗑️ Deleting chat:", id);
      
      const { data } = await axios.delete(`${server}/api/chat/${id}`, {
        headers: getAuthHeaders(),
      });

      console.log("✅ Chat deleted successfully");
      toast.success(data.message || "Chat deleted successfully");
      
      setChats((prev) => prev.filter(chat => chat._id !== id));
      
      if (selected === id) {
        setSelected(null);
        setMessages([]);
        setSelectedCharacter(null);
        
        const remainingChats = chats.filter(chat => chat._id !== id);
        if (remainingChats.length > 0) {
          setSelected(remainingChats[0]._id);
          if (remainingChats[0].character) {
            setSelectedCharacter(remainingChats[0].character);
          }
        }
      }
      
    } catch (error) {
      console.error("❌ Delete chat error:", error);
      
      if (error.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error("Failed to delete chat");
      }
    }
  }

  // Helper functions
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  const getFilteredChats = (chatType = 'all') => {
    if (chatType === "regular") {
      return chats.filter(chat => !chat.character);
    } else if (chatType === "character") {
      return chats.filter(chat => chat.character);
    }
    return chats;
  };

  const getChatTypeDisplay = (chat) => {
    if (chat.character) {
      return `${chat.character.avatar || '🎭'} ${chat.character.name}`;
    }
    return "🤖 AI Assistant";
  };

  // EFFECTS
  useEffect(() => {
    if (isAuthenticated()) {
      fetchChats();
      fetchCharacters();
    }
  }, []);

  useEffect(() => {
    if (selected && isAuthenticated()) {
      fetchMessages();
    }
  }, [selected]);

  // FIXED: Update selected character when switching chats
  useEffect(() => {
    if (selected) {
      const currentChat = chats.find(chat => chat._id === selected);
      if (currentChat) {
        setSelectedCharacter(currentChat.character || null);
        console.log("🔄 Switched to chat character:", currentChat.character?.name || "Regular AI");
      }
    }
  }, [selected, chats]);

  return (
    <ChatContext.Provider
      value={{
        // EXISTING VALUES
        fetchResponse,
        messages,
        prompt,
        setPrompt,
        newRequestLoading,
        chats,
        createChat,
        createLod,
        selected,
        setSelected,
        loading,
        setLoading,
        deleteChat,
        fetchChats,
        isAuthenticated,
        setMessages,

        // CHARACTER VALUES
        characters,
        selectedCharacter,
        setSelectedCharacter,
        charactersLoading,
        characterCreateLoading,
        fetchCharacters,
        createCharacter,
        createRegularChat,
        createCharacterChat,
        getFilteredChats,
        getChatTypeDisplay,

        // DISPLAY INFO
        currentChatType: selectedCharacter ? "character" : "regular",
        currentChatDisplay: selectedCharacter ? 
          `${selectedCharacter.avatar || '🎭'} ${selectedCharacter.name}` : 
          "🤖 AI Assistant"
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatData = () => useContext(ChatContext);