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
    } catch {}
  };

  return (
    <div style={t.wrapper}>
      <div style={t.box}>
        <div style={t.header}>
          <span style={t.prompt}>$</span> admin_login
        </div>

        <form onSubmit={handleSubmit}>
          <div style={t.field}>
            <label style={t.label}>email:</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} required style={t.input} placeholder="admin@example.com" />
          </div>
          <div style={t.field}>
            <label style={t.label}>password:</label>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} required style={t.input} />
          </div>

          {error && <div style={t.error}>[error] {error}</div>}

          <button type="submit" disabled={loading} style={t.submit}>
            {loading ? '> authenticating...' : '> authenticate'}
          </button>
        </form>

        <div style={t.hint}>
          dev: admin@example.com / admin123
        </div>
      </div>
    </div>
  );
}

const t = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace" },
  box: { width: '100%', maxWidth: '420px', padding: '32px', border: '1px solid #1f1f1f', backgroundColor: '#111111' },
  header: { fontSize: '16px', color: '#4ade80', marginBottom: '24px' },
  prompt: { color: '#4ade80', marginRight: '6px' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#9ca3af', fontSize: '13px' },
  input: { width: '100%', padding: '10px 12px', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', color: '#d1d5db', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' },
  error: { color: '#ef4444', padding: '8px 0', fontSize: '13px', marginBottom: '8px' },
  submit: { width: '100%', padding: '12px', backgroundColor: '#1a1a1a', color: '#4ade80', border: '1px solid #2a2a2a', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.02em' },
  hint: { marginTop: '16px', fontSize: '11px', color: '#4b5563', textAlign: 'center' },
};

export default AdminLogin;
