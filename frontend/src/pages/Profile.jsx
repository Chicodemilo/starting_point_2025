// ==============================================================================
// File:      frontend/src/pages/Profile.jsx
// Purpose:   User profile page. Shows user info, avatar with upload
//            capability, email change form with verification flow, and
//            a logout button.
// Callers:   App.jsx (route: /profile)
// Callees:   React, react-router-dom, authStore.js, themeStore.js,
//            api/auth.js, PageHeader.jsx, ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { changeEmail, uploadAvatar } from '../api/auth';
import useThemeStore from '../store/themeStore';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5151';

function avatarUrl(user, size = 'md') {
  if (user?.avatar) return `${API_URL}/api/uploads/avatars/${user.avatar}_${size}.jpg`;
  return null;
}

function Profile() {
  const { user, logout, refreshProfile } = useAuthStore();
  const { theme, toggle } = useThemeStore();
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
    <div>
      <PageHeader title="Profile" />

      <div style={contentArea}>
        <ContentCard>
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
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={infoRow}>
              <span style={{ color: 'var(--text-muted)' }}>Email Verified</span>
              <span style={{ color: user.email_verified ? 'var(--brand-success)' : 'var(--brand-warning)', fontWeight: '500' }}>
                {user.email_verified ? 'Yes' : 'No'}
              </span>
            </div>
            {user.pending_email && (
              <div style={infoRow}>
                <span style={{ color: 'var(--text-muted)' }}>Pending Email Change</span>
                <span style={{ color: 'var(--brand-warning)', fontWeight: '500' }}>{user.pending_email}</span>
              </div>
            )}
            <div style={infoRow}>
              <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
              <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: '500' }}>Dark Mode</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {theme === 'dark' ? 'On' : 'Off'}
              </div>
            </div>
            <button
              onClick={toggle}
              style={toggleTrack(theme === 'dark')}
              aria-label="Toggle dark mode"
            >
              <span style={toggleKnob(theme === 'dark')} />
            </button>
          </div>
        </ContentCard>

        <ContentCard>
          <h3 style={{ margin: '0 0 12px' }}>Change Email</h3>
          <form onSubmit={handleChangeEmail} style={{ display: 'flex', gap: '8px' }}>
            <input type="email" placeholder="New email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input-light)', fontSize: '14px' }} />
            <button type="submit" disabled={submitting || !newEmail} style={{ ...btnStyle, backgroundColor: 'var(--brand-primary)', opacity: submitting || !newEmail ? 0.6 : 1 }}>
              {submitting ? 'Sending...' : 'Update'}
            </button>
          </form>
          {emailMsg && <p style={{ color: 'var(--brand-success)', marginTop: '8px', fontSize: '14px' }}>{emailMsg}</p>}
          {emailErr && <p style={{ color: 'var(--brand-danger)', marginTop: '8px', fontSize: '14px' }}>{emailErr}</p>}
        </ContentCard>

        <button onClick={handleLogout} style={{ ...btnStyle, backgroundColor: 'var(--brand-danger)', width: '100%', padding: '14px' }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const avatarStyle = { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '600' };
const avatarImgStyle = { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' };
const avatarOverlay = { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--bg-overlay)', color: 'var(--text-on-brand)', fontSize: '10px', textAlign: 'center', borderRadius: '0 0 28px 28px', padding: '2px 0' };
const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' };
const btnStyle = { padding: '10px 20px', color: 'var(--text-on-brand)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const toggleTrack = (on) => ({ width: '44px', height: '24px', borderRadius: '12px', border: 'none', backgroundColor: on ? 'var(--brand-primary)' : 'var(--border-input)', cursor: 'pointer', position: 'relative', padding: 0, transition: 'background-color 0.2s' });
const toggleKnob = (on) => ({ display: 'block', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white', position: 'absolute', top: '3px', left: on ? '23px' : '3px', transition: 'left 0.2s' });

export default Profile;
