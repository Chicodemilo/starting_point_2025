// ==============================================================================
// File:      frontend/src/pages/Login.jsx
// Purpose:   Login page component. Presents a username/password form,
//            authenticates via the auth store, and redirects to home or
//            terms page on success.
// Callers:   App.jsx (route: /login)
// Callees:   React, react-router-dom, authStore.js
// Modified:  2026-03-01
// ==============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      if (data.user && !data.user.terms_accepted) {
        navigate('/terms');
      } else {
        navigate('/');
      }
    } catch {
      // Error is set in store
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>Log In</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError(); }}
              required
              style={inputStyle}
              placeholder="Enter username or email"
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
              style={inputStyle}
            />
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button type="submit" disabled={loading} style={submitStyle}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#7f8c8d' }}>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', border: '2px solid #bdc3c7', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' };
const errorStyle = { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' };
const submitStyle = { width: '100%', backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' };

export default Login;
