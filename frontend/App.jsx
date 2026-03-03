// ==============================================================================
// File:      frontend/App.jsx
// Purpose:   Root application component. Defines all client-side routes and
//            wraps the app in React Router. Renders AppHeader on authenticated
//            routes with contextual nav links based on active group.
// Callers:   main.jsx
// Callees:   React, react-router-dom, AppHeader.jsx, Login.jsx, Register.jsx,
//            Dashboard.jsx, GroupCreate.jsx, JoinGroup.jsx, GroupDetail.jsx,
//            GroupAdmin.jsx, VerifyEmail.jsx, CheckEmail.jsx, Members.jsx,
//            Activity.jsx, Inbox.jsx, MessageThread.jsx, Profile.jsx,
//            Terms.jsx, Invite.jsx, AdminLayout.jsx, groupStore.js
// Modified:  2026-03-03
// ==============================================================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './src/store/authStore';
import useGroupStore from './src/store/groupStore';
import AppHeader from './src/components/AppHeader';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import GroupCreate from './src/pages/GroupCreate';
import JoinGroup from './src/pages/JoinGroup';
import GroupDetail from './src/pages/GroupDetail';
import GroupAdmin from './src/pages/GroupAdmin';
import VerifyEmail from './src/pages/VerifyEmail';
import CheckEmail from './src/pages/CheckEmail';
import Members from './src/pages/Members';
import Activity from './src/pages/Activity';
import Inbox from './src/pages/Inbox';
import MessageThread from './src/pages/MessageThread';
import Profile from './src/pages/Profile';
import Terms from './src/pages/Terms';
import Invite from './src/pages/Invite';
import AdminLayout from './src/pages/admin/AdminLayout';

const PUBLIC_PATHS = ['/', '/login', '/register', '/verify-email', '/check-email'];

function AppShell() {
  const location = useLocation();
  const token = useAuthStore(state => state.token);
  const isAuthenticated = !!token;
  const { activeGroup } = useGroupStore();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);
  const isAdmin = location.pathname.startsWith('/overview');
  const showHeader = !isPublic && !isAdmin;
  const showContentWrapper = !isPublic && !isAdmin;

  // Nav links: Dashboard is always present, others appear when a group is active
  const navLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    ...(activeGroup ? [
      { label: 'Members', to: '/members' },
      { label: 'Activity', to: '/activity' },
    ] : []),
  ];

  const publicRoutes = (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/check-email" element={<CheckEmail />} />
    </Routes>
  );

  const authenticatedRoutes = (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/members" element={<Members />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/groups/create" element={<GroupCreate />} />
      <Route path="/join" element={<JoinGroup />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/groups/:id/admin" element={<GroupAdmin />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/invite" element={<Invite />} />
      <Route path="/inbox" element={<Inbox />} />
      <Route path="/inbox/conversation/:id" element={<MessageThread />} />
      <Route path="/overview/*" element={<AdminLayout />} />
    </Routes>
  );

  if (isPublic) {
    return (
      <div id="app-root" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
        {publicRoutes}
      </div>
    );
  }

  // Guard: kick to login if not authenticated
  if (!isAuthenticated && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div id="app-root" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {showHeader && <AppHeader links={navLinks} />}
      {showContentWrapper ? (
        <div style={contentContainer}>
          {authenticatedRoutes}
        </div>
      ) : (
        authenticatedRoutes
      )}
    </div>
  );
}

const contentContainer = {
  maxWidth: '960px',
  minWidth: '320px',
  width: '92%',
  margin: '0 auto',
  backgroundColor: 'var(--bg-surface)',
  borderLeft: '1px solid var(--border-medium)',
  borderRight: '1px solid var(--border-medium)',
  minHeight: 'calc(100vh - 100px)',
  padding: '0',
};

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
