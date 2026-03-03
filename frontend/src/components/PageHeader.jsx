// ==============================================================================
// File:      frontend/src/components/PageHeader.jsx
// Purpose:   Standardized page header. Consistent title, optional subtitle,
//            and optional right-side action across all pages.
// Callers:   Dashboard.jsx, Members.jsx, Activity.jsx, Profile.jsx, Inbox.jsx,
//            GroupDetail.jsx, GroupAdmin.jsx
// Modified:  2026-03-03
// ==============================================================================
import React from 'react';

function PageHeader({ title, subtitle, action }) {
  return (
    <div style={wrapper}>
      <div style={textBlock}>
        <h1 style={titleStyle}>{title}</h1>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      </div>
      {action && <div style={actionBlock}>{action}</div>}
    </div>
  );
}

const wrapper = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '24px 24px 20px',
  borderBottom: '1px solid var(--border-light)',
  marginBottom: '24px',
};

const textBlock = {
  minWidth: 0,
};

const titleStyle = {
  margin: 0,
  fontSize: '22px',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const subtitleStyle = {
  margin: '4px 0 0',
  fontSize: '14px',
  color: 'var(--text-muted)',
};

const actionBlock = {
  flexShrink: 0,
  marginLeft: '16px',
};

export default PageHeader;
