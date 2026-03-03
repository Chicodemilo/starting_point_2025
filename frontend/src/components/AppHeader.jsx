// ==============================================================================
// File:      frontend/src/components/AppHeader.jsx
// Purpose:   Main application header shown on authenticated routes. Displays
//            app name, active group, user avatar, and navigation bar.
// Callers:   App.jsx
// Callees:   React, react-router-dom, NavBar.jsx, authStore.js, groupStore.js,
//            alertStore.js
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import useAuthStore from '../store/authStore';
import useGroupStore from '../store/groupStore';
import useAlertStore from '../store/alertStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5151';
const APP_NAME = import.meta.env.VITE_APP_NAME || 'My App';

function avatarUrl(user) {
  if (user?.avatar) return `${API_URL}/api/uploads/avatars/${user.avatar}_sm.jpg`;
  return null;
}

function groupIconUrl(group) {
  if (group?.icon) return `${API_URL}/api/uploads/group_icons/${group.icon}_sm.jpg`;
  return null;
}

function AppHeader({ links = [] }) {
  const { user } = useAuthStore();
  const { activeGroup } = useGroupStore();
  const { unreadCount, fetchUnreadCount } = useAlertStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const avatarSrc = avatarUrl(user);
  const groupSrc = groupIconUrl(activeGroup);

  return (
    <header style={headerStyle}>
      <div style={headerInner}>
        {/* Top section */}
        <div style={topRow}>
          {/* Left: App name */}
          <Link to="/dashboard" style={appNameStyle}>
            {APP_NAME}
          </Link>

          {/* Center: Active group */}
          <div style={groupSection}>
            {activeGroup ? (
              <Link to={`/groups/${activeGroup.id}`} style={groupLink}>
                {groupSrc ? (
                  <img src={groupSrc} alt="" style={groupIconStyle} />
                ) : (
                  <span style={groupIconPlaceholder}>
                    {activeGroup.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span style={groupNameStyle}>{activeGroup.name}</span>
              </Link>
            ) : (
              <Link to="/dashboard" style={noGroupStyle}>
                No group selected
              </Link>
            )}
          </div>

          {/* Right: User avatar */}
          <Link to="/profile" style={avatarLink}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="" style={avatarImgStyle} />
            ) : (
              <span style={avatarPlaceholder}>
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </Link>
        </div>

        {/* Bottom section: NavBar */}
        <NavBar links={links} alertCount={unreadCount} />
      </div>
    </header>
  );
}

const headerStyle = {
  width: '100%',
  backgroundColor: 'var(--bg-surface)',
  borderBottom: '1px solid var(--border-medium)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
};

const headerInner = {
  maxWidth: '960px',
  minWidth: '320px',
  width: '92%',
  margin: '0 auto',
};

const topRow = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 16px',
  borderBottom: '1px solid var(--border-light)',
};

const appNameStyle = {
  fontSize: '15px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const groupSection = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  minWidth: 0,
};

const groupLink = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  color: 'var(--text-primary)',
};

const groupIconStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  objectFit: 'cover',
};

const groupIconPlaceholder = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  backgroundColor: 'var(--brand-primary)',
  color: 'var(--text-on-brand)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '600',
  flexShrink: 0,
};

const groupNameStyle = {
  fontSize: '18px',
  fontWeight: '600',
  color: 'var(--text-primary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const noGroupStyle = {
  fontSize: '13px',
  color: 'var(--text-faint)',
  textDecoration: 'none',
  fontStyle: 'italic',
};

const avatarLink = {
  textDecoration: 'none',
  flexShrink: 0,
};

const avatarImgStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  objectFit: 'cover',
  display: 'block',
};

const avatarPlaceholder = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'var(--brand-primary)',
  color: 'var(--text-on-brand)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: '600',
};

export default AppHeader;
