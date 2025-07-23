// pages/Home.jsx - Enhanced with Character Support
import React, { useState, useEffect, useRef } from 'react';
import { ChatData } from '../context/ChatContext';
import { UserData } from '../context/UserContext';
import CharacterSelector from '../components/CharacterSelector';
import { LoadingSpinner } from '../components/Loading';
import toast from 'react-hot-toast';
import './Home.css';

const Home = () => {
  const {
    messages,
    prompt,
    setPrompt,
    newRequestLoading,
    chats,
    createLod,
    selected,
    setSelected,
    loading,
    deleteChat,
    fetchResponse,
    selectedCharacter,
    currentChatDisplay,
    currentChatType,
    getFilteredChats,
    getChatTypeDisplay,
    switchChatCharacter,
    isCharacterSystemAvailable
  } = ChatData();

  const { user, logoutHandler } = UserData();

  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatFilter, setChatFilter] = useState('all'); // 'all', 'regular', 'character'
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      fetchResponse();
    }
  };

  // Handle chat selection
  const handleChatSelect = (chatId) => {
    setSelected(chatId);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Handle character switching in current chat
  const handleSwitchCharacter = () => {
    if (selected) {
      setShowCharacterSelector(true);
    } else {
      toast.error('Please select a chat first');
    }
  };

  // Format timestamp
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date for chat list
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get filtered chats based on current filter
  const filteredChats = chats.filter(chat => {
    if (chatFilter === 'regular') return !chat.character;
    if (chatFilter === 'character') return chat.character;
    return true; // 'all'
  });

  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h3>{user?.name || 'User'}</h3>
              <span>{user?.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={logoutHandler} title="Logout">
            🚪
          </button>
        </div>

        {/* New Chat Button */}
        <div className="new-chat-section">
          <button 
            className="new-chat-btn"
            onClick={() => setShowCharacterSelector(true)}
            disabled={createLod}
          >
            {createLod ? '⏳ Creating...' : '➕ New Chat'}
          </button>
        </div>

        {/* Chat Filter */}
        <div className="chat-filter">
          <select 
            value={chatFilter}
            onChange={(e) => setChatFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Chats</option>
            <option value="regular">🤖 AI Assistant</option>
            <option value="character">🎭 Characters</option>
          </select>
        </div>

        {/* Chat List */}
        <div className="chat-list">
          {loading && chats.length === 0 ? (
            <div className="loading-chats">
              <LoadingSpinner />
              <p>Loading chats...</p>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                className={`chat-item ${selected === chat._id ? 'active' : ''}`}
                onClick={() => handleChatSelect(chat._id)}
              >
                <div className="chat-item-header">
                  <div className="chat-type-indicator">
                    {chat.character ? (
                      <span className="character-indicator">
                        {chat.character.avatar || '🎭'} {chat.character.name}
                      </span>
                    ) : (
                      <span className="ai-indicator">🤖 AI Assistant</span>
                    )}
                  </div>
                  <button
                    className="delete-chat-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this chat?')) {
                        deleteChat(chat._id);
                      }
                    }}
                    title="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
                <div className="chat-item-content">
                  <p className="chat-title">{chat.title || 'New Chat'}</p>
                  <p className="latest-message">{chat.latestMessage}</p>
                  <span className="chat-date">{formatDate(chat.updatedAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-chats">
              <p>No {chatFilter === 'all' ? '' : chatFilter} chats yet.</p>
              <button 
                className="start-chat-btn"
                onClick={() => setShowCharacterSelector(true)}
              >
                Start your first chat!
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Toggle for Mobile */}
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="current-chat-info">
                <h2>{currentChatDisplay}</h2>
                <span className="chat-type-badge">
                  {currentChatType === 'character' ? '🎭 Character Chat' : '🤖 AI Assistant'}
                </span>
              </div>
              <div className="chat-actions">
                <button 
                  className="switch-character-btn"
                  onClick={handleSwitchCharacter}
                  title="Switch character or AI"
                >
                  🔄 Switch
                </button>
                {!sidebarOpen && (
                  <button 
                    className="show-sidebar-btn"
                    onClick={() => setSidebarOpen(true)}
                  >
                    📋
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {loading && messages.length === 0 ? (
                <div className="loading-messages">
                  <LoadingSpinner />
                  <p>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg._id} className="message-pair">
                    {/* User Message */}
                    <div className="message user-message">
                      <div className="message-content">
                        <p>{msg.question}</p>
                      </div>
                      <div className="message-meta">
                        <span className="message-sender">You</span>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>

                    {/* AI/Character Response */}
                    <div className="message ai-message">
                      <div className="message-avatar">
                        {selectedCharacter ? selectedCharacter.avatar || '🎭' : '🤖'}
                      </div>
                      <div className="message-content">
                        <p dangerouslySetInnerHTML={{ __html: msg.answer }}></p>
                      </div>
                      <div className="message-meta">
                        <span className="message-sender">
                          {msg.characterUsed || currentChatDisplay}
                        </span>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-messages">
                  <div className="welcome-message">
                    <h3>👋 Welcome to your chat with {currentChatDisplay}!</h3>
                    <p>
                      {currentChatType === 'character' && selectedCharacter ? 
                        `Start a conversation with ${selectedCharacter.name}. ${selectedCharacter.description}` :
                        'Start a conversation with your AI assistant. Ask anything!'
                      }
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <form onSubmit={handleSubmit} className="message-form">
                <div className="input-wrapper">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Message ${currentChatDisplay}...`}
                    disabled={newRequestLoading}
                    rows="1"
                    className="message-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={newRequestLoading || !prompt.trim()}
                    className="send-button"
                  >
                    {newRequestLoading ? '⏳' : '📤'}
                  </button>
                </div>
              </form>
              <div className="input-hint">
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="no-chat-selected">
            <div className="welcome-screen">
              <h1>🤖 Welcome to Enhanced AI Chat!</h1>
              <p>Choose how you'd like to chat:</p>
              
              <div className="chat-options">
                <div className="chat-option">
                  <div className="option-icon">🤖</div>
                  <h3>AI Assistant</h3>
                  <p>Helpful, knowledgeable AI for general assistance</p>
                </div>
                
                <div className="chat-option">
                  <div className="option-icon">🎭</div>
                  <h3>Character Chat</h3>
                  <p>Talk with Einstein, Shakespeare, Sherlock Holmes, or create your own!</p>
                </div>
              </div>
              
              <button 
                className="get-started-btn"
                onClick={() => setShowCharacterSelector(true)}
                disabled={createLod}
              >
                {createLod ? '⏳ Creating...' : '🚀 Get Started'}
              </button>
              
              {isCharacterSystemAvailable && isCharacterSystemAvailable() && (
                <div className="features-preview">
                  <h4>✨ Available Characters:</h4>
                  <div className="character-preview">
                    <span>🧠 Einstein</span>
                    <span>🔍 Sherlock Holmes</span>
                    <span>🎭 Shakespeare</span>
                    <span>⚡ Create Your Own</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Character Selector Modal */}
      {showCharacterSelector && (
        <CharacterSelector onClose={() => setShowCharacterSelector(false)} />
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;