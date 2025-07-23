// components/Loading.jsx - Loading Components for the App

import React from 'react';
import './Loading.css';

// Large loading spinner for app initialization
export const LoadingBig = () => {
  return (
    <div className="loading-big-container">
      <div className="loading-big-content">
        <div className="loading-big-spinner"></div>
        <h2>🤖 Loading AI Chat...</h2>
        <p>Preparing your enhanced chat experience</p>
      </div>
    </div>
  );
};

// Small loading spinner for in-app loading states
export const LoadingSpinner = () => {
  return <div className="loading-spinner"></div>;
};

// Loading with text
export const LoadingWithText = ({ text = "Loading..." }) => {
  return (
    <div className="loading-with-text">
      <LoadingSpinner />
      <span>{text}</span>
    </div>
  );
};

// Loading overlay for forms
export const LoadingOverlay = ({ children, loading, text = "Loading..." }) => {
  return (
    <div className="loading-overlay-container">
      {children}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-overlay-content">
            <LoadingSpinner />
            <span>{text}</span>
          </div>
        </div>
      )}
    </div>
  );
};