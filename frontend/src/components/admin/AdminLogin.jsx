import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAdminStore from '../../stores/adminStore';

function AdminLogin() {
  // Local form state
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Admin store state and actions
  const { 
    isAuthenticated, 
    adminUser, 
    stats,
    login, 
    logout, 
    initialize,
    setStats 
  } = useAdminStore();
  
  // Initialize store on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Load stats when authenticated (mock data for now)
  useEffect(() => {
    if (isAuthenticated) {
      // Mock stats data - will be replaced with API calls later
      setStats({
        totalUsers: 5,
        totalCategories: 12,
        totalEvidence: 4,
        totalVotes: 7
      });
    }
  }, [isAuthenticated, setStats]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to authenticate admin
      const response = await axios.post('/api/admin/login', {
        email: credentials.email,
        password: credentials.password
      });

      if (response.data.success && response.data.user.is_admin) {
        // Use adminStore login action
        login(response.data.user, response.data.token);
        setCredentials({ email: '', password: '' }); // Clear form
      } else {
        setError('Invalid credentials or insufficient privileges');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ecf0f1', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#2c3e50', 
            margin: '0 0 10px 0', 
            fontSize: '1.8em' 
          }}>
            🛡️ Admin Login
          </h1>
          <p style={{ 
            color: '#7f8c8d', 
            margin: '0',
            fontSize: '14px'
          }}>
            Right to Remain - Administrative Access
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50',
              fontWeight: '500'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #bdc3c7',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
              placeholder="admin@example.com"
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#2c3e50',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #bdc3c7',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '10px', 
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#95a5a6' : '#2c3e50',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#34495e';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#2c3e50';
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#7f8c8d'
        }}>
          <p style={{ margin: '0' }}>
            For testing: <strong>m@test.com</strong> / <strong>111</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
