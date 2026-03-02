// ==============================================================================
// File:      frontend/App.jsx
// Purpose:   Root application component. Defines all client-side routes and
//            wraps the app in React Router. Serves as the top-level layout
//            shell rendered by main.jsx.
// Callers:   main.jsx
// Callees:   React, react-router-dom, Home.jsx, Login.jsx, Register.jsx,
//            Dashboard.jsx, Groups.jsx, GroupDetail.jsx, GroupAdmin.jsx,
//            VerifyEmail.jsx, CheckEmail.jsx, GroupPicker.jsx, Inbox.jsx,
//            MessageThread.jsx, Profile.jsx, Terms.jsx, Invite.jsx,
//            AdminLayout.jsx
// Modified:  2026-03-01
// ==============================================================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import Groups from './src/pages/Groups';
import GroupDetail from './src/pages/GroupDetail';
import GroupAdmin from './src/pages/GroupAdmin';
import VerifyEmail from './src/pages/VerifyEmail';
import CheckEmail from './src/pages/CheckEmail';
import GroupPicker from './src/pages/GroupPicker';
import Inbox from './src/pages/Inbox';
import MessageThread from './src/pages/MessageThread';
import Profile from './src/pages/Profile';
import Terms from './src/pages/Terms';
import Invite from './src/pages/Invite';
import AdminLayout from './src/pages/admin/AdminLayout';

function App() {
  return (
    <Router>
      <div id="app-root" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:id/admin" element={<GroupAdmin />} />
          <Route path="/group-picker" element={<GroupPicker />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/conversation/:id" element={<MessageThread />} />
          <Route path="/overview/*" element={<AdminLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
