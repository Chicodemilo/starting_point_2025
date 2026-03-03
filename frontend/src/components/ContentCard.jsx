// ==============================================================================
// File:      frontend/src/components/ContentCard.jsx
// Purpose:   Standardized content card. Provides consistent padding, width,
//            and spacing for page content sections.
// Callers:   Dashboard.jsx, Members.jsx, Activity.jsx, Profile.jsx, Inbox.jsx,
//            GroupDetail.jsx, GroupAdmin.jsx
// Modified:  2026-03-03
// ==============================================================================
import React from 'react';

function ContentCard({ children, style }) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      {children}
    </div>
  );
}

const cardStyle = {
  padding: '20px 24px',
  backgroundColor: 'var(--bg-surface-alt)',
  borderRadius: '8px',
  border: '1px solid var(--border-primary)',
  marginBottom: '16px',
};

export default ContentCard;
