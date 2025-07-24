// src/main.jsx - FIXED SERVER URL FOR DEPLOYMENT

// FIXED: Point to your actual backend URL
export const server = import.meta.env.VITE_SERVER_URL ||
                       import.meta.env.REACT_APP_SERVER_URL ||
                       "https://ai-character-chatbot-7.onrender.com";

console.log('🔗 Frontend connecting to server:', server);

// Add this to verify connection
if (import.meta.env.DEV) {
  console.log('🧪 Development mode - using:', server);
} else {
  console.log('🚀 Production mode - using:', server);
}

// Test the connection
fetch(`${server}/health`)
  .then(response => {
    if (response.ok) {
      console.log('✅ Backend connection successful');
    } else {
      console.error('❌ Backend connection failed:', response.status);
    }
  })
  .catch(error => {
    console.error('❌ Backend unreachable:', error.message);
  });

// Rest of your main.jsx file...
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './context/UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
)