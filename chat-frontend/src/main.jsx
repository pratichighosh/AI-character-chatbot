// src/main.jsx - CORRECTED TO USE BACKEND URL
// ✅ CAPTURE ALL FETCH REQUESTS - ADD THIS AT THE VERY TOP OF main.jsx
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  const options = args[1] || {};
  const method = options.method || 'GET';
  
  if (url.includes('/api/user/verify')) {
    console.error('🚨 === INTERCEPTED REQUEST TO VERIFY ===');
    console.error('🚨 URL:', url);
    console.error('🚨 Method:', method);
    console.error('🚨 Options:', options);
    console.error('🚨 Stack trace:', new Error().stack);
    
    if (method === 'GET') {
      console.error('🚨 BLOCKING ILLEGAL GET REQUEST TO VERIFY!');
      return Promise.reject(new Error('GET requests to verify are blocked'));
    }
  }
  
  return originalFetch.apply(this, args);
};

// Also capture axios requests
import axios from 'axios';
const originalAxiosGet = axios.get;
axios.get = function(...args) {
  const url = args[0];
  if (url.includes('/api/user/verify')) {
    console.error('🚨 AXIOS GET TO VERIFY BLOCKED!', url);
    return Promise.reject(new Error('Axios GET to verify blocked'));
  }
  return originalAxiosGet.apply(this, args);
};
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