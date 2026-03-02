import React from 'react';
import useAuthStore from '../store/authStore';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'My App';

function Home() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5em', margin: '0 0 10px 0', color: '#2c3e50' }}>{APP_NAME}</h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1em' }}>
          {isAuthenticated() ? `Welcome back, ${user?.username}!` : 'Welcome! Please log in or register.'}
        </p>
      </header>

      {!isAuthenticated() && (
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <a href="/login" style={buttonStyle}>Log In</a>
          <a href="/register" style={{ ...buttonStyle, backgroundColor: '#27ae60' }}>Register</a>
        </div>
      )}

      {isAuthenticated() && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <a href="/groups" style={cardStyle}>
            <h3>My Groups</h3>
            <p>View and manage your groups</p>
          </a>
          <a href="/dashboard" style={cardStyle}>
            <h3>Dashboard</h3>
            <p>View your activity and items</p>
          </a>
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  display: 'inline-block',
  padding: '12px 32px',
  backgroundColor: '#3498db',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '500'
};

const cardStyle = {
  display: 'block',
  padding: '24px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #dee2e6',
  textDecoration: 'none',
  color: '#2c3e50'
};

export default Home;
