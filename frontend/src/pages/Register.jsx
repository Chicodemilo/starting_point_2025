// ==============================================================================
// File:      frontend/src/pages/Register.jsx
// Purpose:   Registration page component. Presents a signup form with
//            client-side validation, creates the account via the auth
//            store, and redirects to the check-email page on success.
// Callers:   App.jsx (route: /register)
// Callees:   React, react-router-dom, authStore.js,
//            services/validation.js
// Modified:  2026-03-03
// ==============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { validateRegistration } from '../services/validation';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    clearError();
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(form);
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }
    try {
      await register(form.username, form.email, form.password);
      navigate('/check-email');
    } catch {
      // Error is set in store
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-page-public)' }}>
      <div style={{ backgroundColor: 'var(--bg-surface)', padding: '40px', borderRadius: '12px', boxShadow: 'var(--shadow-card)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-primary)' }}>Create Account</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username</label>
            <input type="text" value={form.username} onChange={(e) => handleChange('username', e.target.value)} required style={inputStyle} />
            {errors.username && <p style={fieldErrorStyle}>{errors.username}</p>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required style={inputStyle} />
            {errors.email && <p style={fieldErrorStyle}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required style={inputStyle} />
            {errors.password && <p style={fieldErrorStyle}>{errors.password}</p>}
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button type="submit" disabled={loading} style={submitStyle}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', border: '2px solid var(--border-input)', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' };
const errorStyle = { backgroundColor: 'var(--bg-error)', color: 'var(--text-error)', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' };
const fieldErrorStyle = { color: 'var(--brand-danger)', fontSize: '13px', marginTop: '4px' };
const submitStyle = { width: '100%', backgroundColor: 'var(--brand-success)', color: 'var(--text-on-brand)', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' };

export default Register;
