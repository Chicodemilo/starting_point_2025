import React, { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import AdminNavigation from './AdminNavigation';
import AdminMain from './AdminMain';
import useAdminStore from '../../stores/adminStore';
import { 
  AuthProvider,
  AdminRoute,
  useAuth,
  useSessionTimeout,
  securityMonitor,
  secureStorage,
  SecureRandom
} from '../../security';

const MainOverview = () => {
  // Admin store state and actions
  const { 
    adminUser, 
    logout 
  } = useAdminStore();

  const [activeView, setActiveView] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const [securityReport, setSecurityReport] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [adminMetrics, setAdminMetrics] = useState({
    totalSessions: 0,
    activeSessions: 0,
    securityEvents: 0,
    lastLogin: null
  });

  // Initialize security monitoring for admin panel
  useEffect(() => {
    // Initialize admin security (already initialized by default)
    // securityMonitor is automatically initialized
    
    // Log admin panel access
    securityMonitor.logEvent('ADMIN_PANEL_ACCESS', { 
      user: adminUser?.username || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Load admin session info
    const sessionData = secureStorage.getItem('admin_session_info');
    setSessionInfo(sessionData || {
      sessionId: SecureRandom.uuid(),
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    });
    
    // Get initial security report
    updateSecurityReport();
    
    // Set up periodic security monitoring
    const securityInterval = setInterval(() => {
      updateSecurityReport();
      updateAdminMetrics();
    }, 30000); // Update every 30 seconds
    
    // Cleanup function
    return () => {
      clearInterval(securityInterval);
      securityMonitor.logEvent('ADMIN_PANEL_LEAVE', { 
        user: adminUser?.username || 'unknown',
        sessionDuration: sessionInfo ? 
          Date.now() - new Date(sessionInfo.startTime).getTime() : 0
      });
    };
  }, [adminUser]);

  // Screen size monitoring
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 750);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const updateSecurityReport = () => {
    const report = securityMonitor.getSecurityReport();
    setSecurityReport(report);
    
    // Store security report for admin dashboard
    secureStorage.setItem('admin_security_report', report, 60); // 1 hour expiration
  };

  const updateAdminMetrics = () => {
    // Simulate admin metrics (in real app, fetch from API)
    setAdminMetrics(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + Math.floor(Math.random() * 2),
      activeSessions: Math.floor(Math.random() * 10) + 1,
      securityEvents: securityReport ? securityReport.totalEvents : 0,
      lastLogin: adminUser?.lastLogin || new Date().toISOString()
    }));
  };

  const handleViewChange = (view) => {
    // Log view changes for security monitoring
    securityMonitor.logEvent('ADMIN_VIEW_CHANGE', { 
      from: activeView, 
      to: view,
      user: adminUser?.username || 'unknown'
    });
    
    setActiveView(view);
    
    // Update session activity
    if (sessionInfo) {
      const updatedSession = {
        ...sessionInfo,
        lastActivity: new Date().toISOString()
      };
      setSessionInfo(updatedSession);
      secureStorage.setItem('admin_session_info', updatedSession, 480); // 8 hours
    }
  };

  const handleLogout = () => {
    // Log admin logout
    securityMonitor.logEvent('ADMIN_LOGOUT', { 
      user: adminUser?.username || 'unknown',
      sessionDuration: sessionInfo ? 
        Date.now() - new Date(sessionInfo.startTime).getTime() : 0
    });
    
    // Clear admin session data
    secureStorage.removeItem('admin_session_info');
    secureStorage.removeItem('admin_security_report');
    
    // Use adminStore logout action
    logout();
  };

  const handleSecurityAction = (action, details = {}) => {
    securityMonitor.logEvent('ADMIN_SECURITY_ACTION', {
      action,
      details,
      user: adminUser?.username || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Update security report immediately
    updateSecurityReport();
  };

  return (
    <AuthProvider>
      <AdminRoute>
        <div style={containerStyle}>
          {/* Security Status Bar */}
          {securityReport && (
            <div style={securityBarStyle}>
              <div style={securityItemStyle}>
                <span style={securityLabelStyle}>🛡️ Security Score:</span>
                <span style={{
                  ...securityValueStyle,
                  color: securityReport.securityScore >= 80 ? '#28a745' : 
                         securityReport.securityScore >= 60 ? '#ffc107' : '#dc3545'
                }}>
                  {securityReport.securityScore}/100
                </span>
              </div>
              <div style={securityItemStyle}>
                <span style={securityLabelStyle}>📊 Events:</span>
                <span style={securityValueStyle}>{securityReport.totalEvents}</span>
              </div>
              <div style={securityItemStyle}>
                <span style={securityLabelStyle}>⚠️ Warnings:</span>
                <span style={{
                  ...securityValueStyle,
                  color: securityReport.warningCount > 0 ? '#ffc107' : '#28a745'
                }}>
                  {securityReport.warningCount}
                </span>
              </div>
              <div style={securityItemStyle}>
                <span style={securityLabelStyle}>🚨 Critical:</span>
                <span style={{
                  ...securityValueStyle,
                  color: securityReport.criticalCount > 0 ? '#dc3545' : '#28a745'
                }}>
                  {securityReport.criticalCount}
                </span>
              </div>
              {sessionInfo && (
                <div style={securityItemStyle}>
                  <span style={securityLabelStyle}>⏱️ Session:</span>
                  <span style={securityValueStyle}>
                    {Math.floor((Date.now() - new Date(sessionInfo.startTime).getTime()) / 60000)}m
                  </span>
                </div>
              )}
            </div>
          )}
          
          <AdminHeader 
            securityReport={securityReport}
            adminMetrics={adminMetrics}
            onSecurityAction={handleSecurityAction}
          />
          
          <div style={isMobile ? mobileBodyStyle : bodyStyle}>
            <AdminNavigation 
              activeView={activeView} 
              onViewChange={handleViewChange}
              securityReport={securityReport}
            />
            <AdminMain 
              activeView={activeView}
              securityReport={securityReport}
              adminMetrics={adminMetrics}
              sessionInfo={sessionInfo}
              onSecurityAction={handleSecurityAction}
            />
          </div>
          
          {/* Security Footer */}
          <div style={securityFooterStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '0.9em', color: '#666' }}>
                🔐 Admin Session Active | User: {adminUser?.username || 'Unknown'}
              </span>
              {adminMetrics.activeSessions > 0 && (
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  👥 Active Sessions: {adminMetrics.activeSessions}
                </span>
              )}
              <button
                onClick={() => handleSecurityAction('SECURITY_REFRESH')}
                style={{
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.8em'
                }}
              >
                🔄 Refresh Security
              </button>
            </div>
          </div>
        </div>
      </AdminRoute>
    </AuthProvider>
  );

  // Security monitoring wrapper component
  function AdminSecurityWrapper({ children }) {
    const { user, hasPermission } = useAuth();
    const { timeRemaining } = useSessionTimeout(30); // 30 minute timeout
    
    useEffect(() => {
      if (timeRemaining <= 300000 && timeRemaining > 0) { // 5 minutes warning
        securityMonitor.logEvent('SESSION_TIMEOUT_WARNING', {
          timeRemaining: Math.floor(timeRemaining / 1000),
          user: user?.username
        });
      }
    }, [timeRemaining, user]);
    
    if (!hasPermission('admin')) {
      securityMonitor.logEvent('UNAUTHORIZED_ADMIN_ACCESS', {
        user: user?.username || 'anonymous',
        timestamp: new Date().toISOString()
      });
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>🚫 Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
        </div>
      );
    }
    
    return children;
  }
};

const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  fontFamily: 'Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column'
};

const bodyStyle = {
  display: 'flex',
  flex: 1,
  height: 'calc(100vh - 80px)' // Subtract header height
};

const mobileBodyStyle = {
  display: 'block', // Stack vertically on mobile
  flex: 1,
  height: 'calc(100vh - 80px)', // Subtract header height
  position: 'relative'
};

const securityBarStyle = {
  backgroundColor: '#2c3e50',
  color: 'white',
  padding: '8px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.9em',
  borderBottom: '2px solid #34495e',
  flexWrap: 'wrap',
  gap: '10px'
};

const securityItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px'
};

const securityLabelStyle = {
  fontWeight: 'bold',
  marginRight: '3px'
};

const securityValueStyle = {
  fontWeight: 'normal',
  padding: '2px 6px',
  borderRadius: '3px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)'
};

const securityFooterStyle = {
  backgroundColor: '#f8f9fa',
  borderTop: '1px solid #dee2e6',
  padding: '8px 20px',
  fontSize: '0.85em',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export default MainOverview;
