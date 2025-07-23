// src/main.jsx - UPDATED SERVER URL FOR DEPLOYMENT

// FIXED: Point to your actual backend URL
export const server = import.meta.env.VITE_SERVER_URL || 
                      import.meta.env.REACT_APP_SERVER_URL || 
                      "https://ai-character-chatbot-2.onrender.com";

console.log('🔗 Frontend connecting to server:', server);

// Add this to verify connection
if (import.meta.env.DEV) {
  console.log('🧪 Development mode - using:', server);
} else {
  console.log('🚀 Production mode - using:', server);
}

// Rest of your main.jsx file...
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './context/UserContext';
import { ChatProvider } from './context/ChatContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </UserProvider>
  </React.StrictMode>,
)

// ENVIRONMENT VARIABLES FOR FRONTEND DEPLOYMENT
// Create a .env file in your frontend root with:
/*
VITE_SERVER_URL=https://ai-character-chatbot-2.onrender.com
*/