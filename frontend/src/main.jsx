// ==============================================================================
// File:      frontend/src/main.jsx
// Purpose:   Application entry point. Mounts the root React component into
//            the DOM, sets the document title from environment variables,
//            and wraps the app in React.StrictMode.
// Callers:   index.html (Vite entry)
// Callees:   React, ReactDOM, App.jsx
// Modified:  2026-03-01
// ==============================================================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '../App.jsx'
import './main.css';

const appName = import.meta.env.VITE_APP_NAME || 'My App';
document.title = appName;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
