import React, { useState, useEffect } from 'react';
import { 
  securityMonitor, 
  secureStorage, 
  sanitizeInput,
  validateFormData,
  VALIDATION_SCHEMAS 
} from '../security';

function Home() {
  const [systemStatus, setSystemStatus] = useState({
    frontend: 'running',
    backend: 'checking',
    database: 'checking',
    security: 'initializing'
  });
  const [securityReport, setSecurityReport] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Initialize security monitoring (already initialized by default)
    // securityMonitor is automatically initialized
    
    // Log page visit
    securityMonitor.logEvent('PAGE_VISIT', { page: 'home' });
    
    // Load user preferences from secure storage
    const preferences = secureStorage.getItem('user_preferences');
    setUserPreferences(preferences || { theme: 'light', notifications: true });
    
    // Check system status
    checkSystemStatus();
    
    // Get security report
    const report = securityMonitor.getSecurityReport();
    setSecurityReport(report);
    
    // Cleanup function
    return () => {
      securityMonitor.logEvent('PAGE_LEAVE', { page: 'home' });
    };
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Simulate API health check
      setTimeout(() => {
        setSystemStatus(prev => ({
          ...prev,
          backend: 'connected',
          database: 'connected',
          security: 'active'
        }));
      }, 2000);
    } catch (error) {
      console.error('System status check failed:', error);
      setSystemStatus(prev => ({
        ...prev,
        backend: 'error',
        database: 'error'
      }));
    }
  };

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...userPreferences, [key]: value };
    setUserPreferences(newPreferences);
    
    // Save to secure storage with 24-hour expiration
    secureStorage.setItem('user_preferences', newPreferences, 1440);
    
    // Log security event
    securityMonitor.logEvent('USER_PREFERENCE_CHANGE', { preference: key, value });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateFormData(feedbackForm, VALIDATION_SCHEMAS.CONTACT);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      securityMonitor.logEvent('FORM_VALIDATION_ERROR', { 
        form: 'feedback', 
        errors: Object.keys(validation.errors) 
      });
      return;
    }
    
    // Clear errors and use sanitized data
    setFormErrors({});
    console.log('Feedback submitted:', validation.sanitizedData);
    
    // Log successful submission
    securityMonitor.logEvent('FORM_SUBMISSION', { form: 'feedback' });
    
    // Reset form
    setFeedbackForm({ name: '', email: '', message: '' });
    alert('Thank you for your feedback!');
  };

  const handleInputChange = (field, value) => {
    const sanitizedValue = sanitizeInput(value, { 
      maxLength: field === 'message' ? 1000 : 100 
    });
    
    setFeedbackForm(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
      case 'connected':
      case 'active':
        return '✅';
      case 'checking':
      case 'initializing':
        return '🔄';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ backgroundColor: '#f0f0f0', padding: '20px', marginBottom: '20px', textAlign: 'center', borderRadius: '8px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '2.5em', margin: '0 0 10px 0' }}>🌟 Right to Remain 🌟</h1>
        <h2 style={{ color: '#34495e', margin: '0 0 10px 0' }}>Evidence Platform</h2>
        <p style={{ color: '#7f8c8d', fontSize: '1.1em' }}>Secure, monitored, and protected platform for evidence management</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* System Status */}
        <div style={{ backgroundColor: '#e8f4fd', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0 }}>🖥️ System Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p>{getStatusIcon(systemStatus.frontend)} Frontend: {systemStatus.frontend}</p>
            <p>{getStatusIcon(systemStatus.backend)} Backend API: {systemStatus.backend}</p>
            <p>{getStatusIcon(systemStatus.database)} Database: {systemStatus.database}</p>
            <p>{getStatusIcon(systemStatus.security)} Security: {systemStatus.security}</p>
          </div>
        </div>

        {/* Security Report */}
        {securityReport && (
          <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ marginTop: 0 }}>🔒 Security Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p>🛡️ Events Logged: {securityReport.totalEvents}</p>
              <p>⚠️ Warnings: {securityReport.warningCount}</p>
              <p>🚨 Critical Events: {securityReport.criticalCount}</p>
              <p>📊 Session Score: {securityReport.securityScore}/100</p>
            </div>
          </div>
        )}

        {/* User Preferences */}
        {userPreferences && (
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ marginTop: 0 }}>⚙️ User Preferences</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={userPreferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                />
                Enable Notifications
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Theme:
                <select
                  value={userPreferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  style={{ marginLeft: '8px', padding: '4px' }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Form */}
      <div style={{ marginTop: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h2>💬 Feedback Form</h2>
        <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name:</label>
            <input
              type="text"
              value={feedbackForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter your name"
            />
            {formErrors.name && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                {formErrors.name.join(', ')}
              </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              value={feedbackForm.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                {formErrors.email.join(', ')}
              </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message:</label>
            <textarea
              value={feedbackForm.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
              placeholder="Enter your feedback"
            />
            {formErrors.message && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                {formErrors.message.join(', ')}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Submit Feedback
          </button>
        </form>
      </div>

      {/* Next Steps */}
      <div style={{ marginTop: '30px', backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>🚀 Platform Features</h3>
        <ul style={{ lineHeight: '1.6' }}>
          <li>✅ <strong>Security Monitoring:</strong> Real-time threat detection and event logging</li>
          <li>✅ <strong>Input Validation:</strong> XSS protection and data sanitization</li>
          <li>✅ <strong>Secure Storage:</strong> Encrypted client-side data storage</li>
          <li>✅ <strong>Form Protection:</strong> Comprehensive validation and error handling</li>
          <li>✅ <strong>User Preferences:</strong> Secure preference management</li>
          <li>🔄 <strong>API Integration:</strong> Backend security middleware integration</li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
