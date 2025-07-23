// components/CharacterSelector.jsx - FIXED WITH CHARACTER OPTIONS
import React, { useState, useEffect } from 'react';
import { ChatData } from '../context/ChatContext';
import { UserData } from '../context/UserContext';
import { server } from '../main';
import axios from 'axios';
import toast from 'react-hot-toast';
import './CharacterSelector.css';

const CharacterSelector = ({ onClose }) => {
  const { 
    characters, 
    charactersLoading, 
    fetchCharacters, 
    createCharacter, 
    characterCreateLoading,
    createRegularChat,
    createCharacterChat,
    selectedCharacter
  } = ChatData();
  
  const { user } = UserData();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // ✅ FIXED: Default character options with fallback data
  const [characterOptions, setCharacterOptions] = useState({
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
  });
  
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    description: '',
    personality: '',
    customPersonality: '',
    speakingStyle: '',
    customSpeakingStyle: '',
    background: '',
    avatar: '🤖',
    category: 'custom',
    tags: '',
    expertise: '',
    primaryLanguage: 'english',
    responseStyle: 'conversational',
    isPublic: false
  });

  // ✅ FIXED: Enhanced character options fetching with fallback
  useEffect(() => {
    fetchCharacterOptions();
  }, []);

  useEffect(() => {
    if (characters.length === 0 && !charactersLoading) {
      fetchCharacters();
    }
  }, []);

  const fetchCharacterOptions = async () => {
    try {
      // ✅ FIXED: Correct backend URL
      const backendUrl = server || "https://ai-character-chatbot-2.onrender.com";
      const token = localStorage.getItem("token");
      
      console.log('🎭 Fetching character options from:', `${backendUrl}/api/characters/options`);
      
      const { data } = await axios.get(`${backendUrl}/api/characters/options`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Character options fetched:', data);
      
      // Update state with fetched options
      setCharacterOptions(data);
      
    } catch (error) {
      console.error('❌ Failed to fetch character options:', error);
      console.log('🔄 Using default character options as fallback');
      
      // Keep using the default options we initialized with
      toast.error('Using default character options (could not fetch from server)');
    }
  };

  // Filter characters based on search and category
  const filteredCharacters = characters.filter(character => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (character.tags && character.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === 'all' || character.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(characters.map(char => char.category))];

  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    
    if (!newCharacter.name || !newCharacter.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Use custom text if provided, otherwise use selected option
    const finalPersonality = newCharacter.customPersonality.trim() || newCharacter.personality;
    const finalSpeakingStyle = newCharacter.customSpeakingStyle.trim() || newCharacter.speakingStyle;

    if (!finalPersonality || !finalSpeakingStyle) {
      toast.error('Please select or enter personality traits and speaking style');
      return;
    }

    try {
      const characterData = {
        ...newCharacter,
        personality: finalPersonality,
        speakingStyle: finalSpeakingStyle,
        tags: newCharacter.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        expertise: newCharacter.expertise.split(',').map(exp => exp.trim()).filter(exp => exp)
      };
      
      console.log('🎭 Creating character:', characterData);
      
      const createdCharacter = await createCharacter(characterData);
      
      // Reset form
      setNewCharacter({
        name: '', description: '', personality: '', customPersonality: '',
        speakingStyle: '', customSpeakingStyle: '', background: '', avatar: '🤖',
        category: 'custom', tags: '', expertise: '', primaryLanguage: 'english',
        responseStyle: 'conversational', isPublic: false
      });
      setShowCreateForm(false);
      
      // Ask if user wants to start chatting with the new character
      setTimeout(() => {
        if (window.confirm(`Start chatting with ${createdCharacter.name}?`)) {
          createCharacterChat(createdCharacter);
          onClose();
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Character creation failed:', error);
      toast.error('Failed to create character. Please try again.');
    }
  };

  const handleSelectCharacter = (character) => {
    createCharacterChat(character);
    onClose();
  };

  const handleCreateRegular = () => {
    createRegularChat();
    onClose();
  };

  return (
    <div className="character-selector-overlay">
      <div className="character-selector">
        <div className="character-selector-header">
          <h2>🎭 Choose Your AI Companion</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Search and Filter */}
        <div className="selector-controls">
          <input
            type="text"
            placeholder="Search characters by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Regular AI Option */}
        <div className="character-options">
          <div 
            className={`character-card ${!selectedCharacter ? 'selected' : ''}`}
            onClick={handleCreateRegular}
          >
            <div className="character-avatar">🤖</div>
            <div className="character-info">
              <h3>AI Assistant</h3>
              <p>Helpful, knowledgeable AI assistant for general purposes with multi-language support</p>
              <div className="character-meta">
                <span className="category">Assistant</span>
                <span className="usage">Default</span>
                <span className="language">Multilingual</span>
              </div>
            </div>
          </div>

          {/* Character List */}
          {charactersLoading ? (
            <div className="loading-characters">
              <div className="spinner"></div>
              <p>Loading characters...</p>
            </div>
          ) : filteredCharacters.length > 0 ? (
            filteredCharacters.map(character => (
              <div 
                key={character._id}
                className={`character-card ${selectedCharacter?._id === character._id ? 'selected' : ''}`}
                onClick={() => handleSelectCharacter(character)}
              >
                <div className="character-avatar">{character.avatar}</div>
                <div className="character-info">
                  <h3>{character.name}</h3>
                  <p>{character.description}</p>
                  {character.expertise && character.expertise.length > 0 && (
                    <div className="character-expertise">
                      <strong>Expertise:</strong> {character.expertise.join(', ')}
                    </div>
                  )}
                  <div className="character-meta">
                    <span className="category">{character.category}</span>
                    <span className="usage">Used {character.usageCount || 0} times</span>
                    {character.primaryLanguage && (
                      <span className="language">{character.primaryLanguage}</span>
                    )}
                    {character.responseStyle && (
                      <span className="response-style">{character.responseStyle}</span>
                    )}
                    {character.isPublic && <span className="public-badge">Public</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-characters">
              <p>No characters found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Create Character Button */}
        <div className="create-character-section">
          <button 
            className="create-character-btn"
            onClick={() => setShowCreateForm(true)}
          >
            ➕ Create Custom Character
          </button>
        </div>

        {/* Enhanced Create Character Form */}
        {showCreateForm && (
          <div className="create-form-overlay">
            <div className="create-character-form">
              <div className="form-header">
                <h3>✨ Create Realistic Character</h3>
                <button 
                  className="form-close-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateCharacter}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Einstein, Tagore, Your Mentor"
                      value={newCharacter.name}
                      onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Avatar</label>
                    <input
                      type="text"
                      placeholder="🧠 (any emoji)"
                      value={newCharacter.avatar}
                      onChange={(e) => setNewCharacter({...newCharacter, avatar: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    placeholder="Brief description of who this character is and what they're known for"
                    value={newCharacter.description}
                    onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                    required
                  />
                </div>

                {/* ✅ FIXED: Enhanced Personality Selection with working options */}
                <div className="form-group">
                  <label>Personality Traits * ({characterOptions.personalityTraits.length} options available)</label>
                  <select
                    value={newCharacter.personality}
                    onChange={(e) => setNewCharacter({...newCharacter, personality: e.target.value, customPersonality: ''})}
                  >
                    <option value="">Select personality traits...</option>
                    {characterOptions.personalityTraits.map((trait, index) => (
                      <option key={index} value={trait}>{trait}</option>
                    ))}
                    <option value="custom">Custom (enter below)</option>
                  </select>
                  {(newCharacter.personality === 'custom' || newCharacter.personality === '') && (
                    <textarea
                      placeholder="Describe the character's personality traits (e.g., curious, wise, friendly, analytical)"
                      value={newCharacter.customPersonality}
                      onChange={(e) => setNewCharacter({...newCharacter, customPersonality: e.target.value})}
                      className="custom-input"
                    />
                  )}
                </div>

                {/* ✅ FIXED: Enhanced Speaking Style Selection with working options */}
                <div className="form-group">
                  <label>Speaking Style * ({characterOptions.speakingStyles.length} options available)</label>
                  <select
                    value={newCharacter.speakingStyle}
                    onChange={(e) => setNewCharacter({...newCharacter, speakingStyle: e.target.value, customSpeakingStyle: ''})}
                  >
                    <option value="">Select speaking style...</option>
                    {characterOptions.speakingStyles.map((style, index) => (
                      <option key={index} value={style}>{style}</option>
                    ))}
                    <option value="custom">Custom (enter below)</option>
                  </select>
                  {(newCharacter.speakingStyle === 'custom' || newCharacter.speakingStyle === '') && (
                    <textarea
                      placeholder="Describe how this character speaks (e.g., uses metaphors, formal language, storytelling style)"
                      value={newCharacter.customSpeakingStyle}
                      onChange={(e) => setNewCharacter({...newCharacter, customSpeakingStyle: e.target.value})}
                      className="custom-input"
                    />
                  )}
                </div>

                <div className="form-row">
                  {/* ✅ FIXED: Primary Language with working options */}
                  <div className="form-group">
                    <label>Primary Language ({characterOptions.languages.length} options)</label>
                    <select
                      value={newCharacter.primaryLanguage}
                      onChange={(e) => setNewCharacter({...newCharacter, primaryLanguage: e.target.value})}
                    >
                      {characterOptions.languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* ✅ FIXED: Response Style with working options */}
                  <div className="form-group">
                    <label>Response Style ({characterOptions.responseStyles.length} options)</label>
                    <select
                      value={newCharacter.responseStyle}
                      onChange={(e) => setNewCharacter({...newCharacter, responseStyle: e.target.value})}
                    >
                      {characterOptions.responseStyles.map(style => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Background & History</label>
                  <textarea
                    placeholder="Character's background, achievements, historical context, or life story"
                    value={newCharacter.background}
                    onChange={(e) => setNewCharacter({...newCharacter, background: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Areas of Expertise</label>
                  <input
                    type="text"
                    placeholder="science, literature, philosophy, music (comma-separated)"
                    value={newCharacter.expertise}
                    onChange={(e) => setNewCharacter({...newCharacter, expertise: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newCharacter.category}
                      onChange={(e) => setNewCharacter({...newCharacter, category: e.target.value})}
                    >
                      <option value="custom">Custom</option>
                      <option value="assistant">Assistant</option>
                      <option value="friend">Friend</option>
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                      <option value="educational">Educational</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="historical">Historical</option>
                      <option value="fictional">Fictional</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      placeholder="science, genius, helpful (comma-separated)"
                      value={newCharacter.tags}
                      onChange={(e) => setNewCharacter({...newCharacter, tags: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newCharacter.isPublic}
                      onChange={(e) => setNewCharacter({...newCharacter, isPublic: e.target.checked})}
                    />
                    Make this character public (other users can use it)
                  </label>
                </div>

                <div className="form-buttons">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={characterCreateLoading}
                    className="create-btn"
                  >
                    {characterCreateLoading ? '⏳ Creating...' : '✨ Create Character'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterSelector;