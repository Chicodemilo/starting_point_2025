// ==============================================================================
// File:      frontend/src/pages/Invite.jsx
// Purpose:   Invite acceptance page. Allows an invited user to create
//            their account by choosing a username and password, using
//            the invite token from the URL query string.
// Callers:   App.jsx (route: /invite)
// Callees:   React, react-router-dom, authStore.js, api/auth.js
// Modified:  2026-03-03
// ==============================================================================
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { completeInvite } from '../api/auth';

function Invite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await completeInvite(token, username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      useAuthStore.setState({ user: data.user, token: data.token });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete invite');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ color: 'var(--brand-danger)' }}>Invalid Invite</h1>
        <p>No invite token provided.</p>
        <a href="/" style={{ color: 'var(--brand-primary)' }}>Go Home</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '60px auto' }}>
      <h1 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '8px' }}>Accept Invite</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Create your account to get started.</p>

      {error && <div style={{ padding: '12px', backgroundColor: 'var(--bg-error-alt)', color: 'var(--brand-danger)', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={inputStyle} />
        <button type="submit" disabled={loading} style={{ ...inputStyle, backgroundColor: 'var(--brand-success)', color: 'var(--text-on-brand)', border: 'none', cursor: loading ? 'default' : 'pointer', fontWeight: '500', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-input-light)', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' };

export default Invite;
