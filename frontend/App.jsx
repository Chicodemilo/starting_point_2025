import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import Groups from './src/pages/Groups';
import GroupDetail from './src/pages/GroupDetail';
import VerifyEmail from './src/pages/VerifyEmail';
import CheckEmail from './src/pages/CheckEmail';
import GroupPicker from './src/pages/GroupPicker';
import Inbox from './src/pages/Inbox';
import MessageThread from './src/pages/MessageThread';
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
          <Route path="/group-picker" element={<GroupPicker />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/conversation/:id" element={<MessageThread />} />
          <Route path="/overview/*" element={<AdminLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
