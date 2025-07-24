// src/main.jsx - CORRECTED TO USE BACKEND URL

// FIXED: Frontend should connect to BACKEND URL, not full deployment URL
export const server = import.meta.env.VITE_SERVER_URL ||
                       import.meta.env.REACT_APP_SERVER_URL ||
                       "https://ai-character-chatbot-2.onrender.com";

console.log('🔗 Frontend connecting to BACKEND server:', server);

// Add this to verify connection - but check root endpoint instead of /health
if (import.meta.env.DEV) {
  console.log('🧪 Development mode - using backend:', server);
} else {
  console.log('🚀 Production mode - using backend:', server);
}

// Test the connection to your actual backend endpoint
fetch(`${server}/`)
  .then(response => {
    if (response.ok) {
      console.log('✅ Backend connection successful');
      return response.json();
    } else {
      console.error('❌ Backend connection failed:', response.status);
    }
  })
  .then(data => {
    if (data) {
      console.log('📊 Backend info:', data);
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