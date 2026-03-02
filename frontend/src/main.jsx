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
