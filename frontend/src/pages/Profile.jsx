import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { changeEmail, uploadAvatar } from '../api/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5151';

function avatarUrl(user, size = 'md') {
  if (user?.avatar) return `${API_URL}/api/uploads/avatars/${user.avatar}_${size}.jpg`;
  return null;
}

function Profile() {
  const { user, logout, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState(null);
  const [emailErr, setEmailErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) return;
    setSubmitting(true);
    setEmailMsg(null);
    setEmailErr(null);
    try {
      await changeEmail(newEmail);
      setEmailMsg('Verification email sent to your new address. Your email will update once verified.');
      setNewEmail('');
      await refreshProfile();
    } catch (err) {
      setEmailErr(err.response?.data?.error || 'Failed to change email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadAvatar(file);
      await refreshProfile();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const src = avatarUrl(user);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Profile</h1>
        <a href="/" style={{ color: '#3498db', textDecoration: 'none' }}>Back to Home</a>
      </div>

      {/* User Info Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            {src ? (
              <img src={src} alt="avatar" style={avatarImgStyle} />
            ) : (
              <div style={avatarStyle}>{user.username.charAt(0).toUpperCase()}</div>
            )}
            <div style={avatarOverlay}>{uploading ? '...' : 'Edit'}</div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{user.username}</h2>
            <p style={{ margin: '4px 0 0', color: '#7f8c8d' }}>{user.email}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={infoRow}>
            <span style={{ color: '#7f8c8d' }}>Email Verified</span>
            <span style={{ color: user.email_verified ? '#27ae60' : '#e67e22', fontWeight: '500' }}>
              {user.email_verified ? 'Yes' : 'No'}
            </span>
          </div>
          {user.pending_email && (
            <div style={infoRow}>
              <span style={{ color: '#7f8c8d' }}>Pending Email Change</span>
              <span style={{ color: '#e67e22', fontWeight: '500' }}>{user.pending_email}</span>
            </div>
          )}
          <div style={infoRow}>
            <span style={{ color: '#7f8c8d' }}>Member Since</span>
            <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>

      {/* Change Email */}
      <div style={{ ...cardStyle, marginTop: '16px' }}>
        <h3 style={{ margin: '0 0 12px' }}>Change Email</h3>
        <form onSubmit={handleChangeEmail} style={{ display: 'flex', gap: '8px' }}>
          <input type="email" placeholder="New email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }} />
          <button type="submit" disabled={submitting || !newEmail} style={{ ...btnStyle, backgroundColor: '#3498db', opacity: submitting || !newEmail ? 0.6 : 1 }}>
            {submitting ? 'Sending...' : 'Update'}
          </button>
        </form>
        {emailMsg && <p style={{ color: '#27ae60', marginTop: '8px', fontSize: '14px' }}>{emailMsg}</p>}
        {emailErr && <p style={{ color: '#e74c3c', marginTop: '8px', fontSize: '14px' }}>{emailErr}</p>}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} style={{ ...btnStyle, backgroundColor: '#e74c3c', marginTop: '24px', width: '100%', padding: '14px' }}>
        Log Out
      </button>
    </div>
  );
}

const cardStyle = { padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' };
const avatarStyle = { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#3498db', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '600' };
const avatarImgStyle = { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' };
const avatarOverlay = { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '10px', textAlign: 'center', borderRadius: '0 0 28px 28px', padding: '2px 0' };
const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' };
const btnStyle = { padding: '10px 20px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };

export default Profile;
