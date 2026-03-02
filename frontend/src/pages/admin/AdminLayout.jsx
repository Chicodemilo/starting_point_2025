import React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminGroups from './AdminGroups';
import AdminAlerts from './AdminAlerts';
import AdminMessages from './AdminMessages';
import AdminHealth from './AdminHealth';

function AdminLayout() {
  const { isAuthenticated, adminUser, logout, initialize } = useAdminStore();
  const navigate = useNavigate();

  React.useEffect(() => { initialize(); }, []);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ padding: '20px', borderBottom: '1px solid #4a5568' }}>
          <h2 style={{ margin: 0, fontSize: '1.2em', color: 'white' }}>Admin Panel</h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#a0aec0' }}>{adminUser?.email}</p>
        </div>
        <nav style={{ padding: '12px 0' }}>
          <NavLink to="/overview" end style={navLinkStyle}>Dashboard</NavLink>
          <NavLink to="/overview/users" style={navLinkStyle}>Users</NavLink>
          <NavLink to="/overview/groups" style={navLinkStyle}>Groups</NavLink>
          <NavLink to="/overview/alerts" style={navLinkStyle}>Alerts</NavLink>
          <NavLink to="/overview/messages" style={navLinkStyle}>Messages</NavLink>
          <NavLink to="/overview/health" style={navLinkStyle}>Health</NavLink>
        </nav>
        <button onClick={() => { logout(); navigate('/overview'); }} style={logoutBtnStyle}>Logout</button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px', backgroundColor: '#f5f6fa' }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="groups" element={<AdminGroups />} />
          <Route path="alerts" element={<AdminAlerts />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="health" element={<AdminHealth />} />
        </Routes>
      </main>
    </div>
  );
}

const sidebarStyle = { width: '240px', backgroundColor: '#2d3748', color: 'white', display: 'flex', flexDirection: 'column' };
const navLinkStyle = ({ isActive }) => ({ display: 'block', padding: '12px 20px', color: isActive ? 'white' : '#a0aec0', backgroundColor: isActive ? '#4a5568' : 'transparent', textDecoration: 'none', fontSize: '14px' });
const logoutBtnStyle = { marginTop: 'auto', padding: '12px 20px', backgroundColor: '#e53e3e', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px' };

export default AdminLayout;
