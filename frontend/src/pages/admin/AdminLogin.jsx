import React, { useState } from 'react';
import useAdminStore from '../../store/adminStore';

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAdminStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      if (onLogin) onLogin();
    } catch {
      // Error is set in store
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecf0f1', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0', fontSize: '1.8em' }}>Admin Login</h1>
          <p style={{ color: '#7f8c8d', margin: 0, fontSize: '14px' }}>Administrative Access</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} required style={inputStyle} placeholder="admin@example.com" />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Password</label>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} required style={inputStyle} />
          </div>

          {error && <div style={errorStyle}>{error}</div>}

          <button type="submit" disabled={loading} style={submitStyle}>{loading ? 'Signing In...' : 'Sign In'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#7f8c8d' }}>
          Dev credentials: <strong>admin@example.com</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', border: '2px solid #bdc3c7', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' };
const errorStyle = { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' };
const submitStyle = { width: '100%', backgroundColor: '#2c3e50', color: 'white', border: 'none', padding: '14px', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' };

export default AdminLogin;
