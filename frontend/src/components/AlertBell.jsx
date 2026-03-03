// ==============================================================================
// File:      frontend/src/components/AlertBell.jsx
// Purpose:   Small bell icon with optional unread count badge, links to /inbox
// Callers:   NavBar.jsx
// Callees:   React, react-router-dom
// Modified:  2026-03-03
// ==============================================================================
import React from 'react';
import { Link } from 'react-router-dom';

function AlertBell({ count = 0 }) {
  return (
    <Link to="/inbox" style={bellLink} aria-label={`Inbox${count > 0 ? `, ${count} unread` : ''}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span style={badgeStyle}>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

const bellLink = {
  position: 'relative',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
};

const badgeStyle = {
  position: 'absolute',
  top: '-4px',
  right: '-6px',
  backgroundColor: 'var(--brand-danger)',
  color: 'white',
  borderRadius: '50%',
  minWidth: '18px',
  height: '18px',
  fontSize: '11px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
  padding: '0 4px',
  boxSizing: 'border-box',
};

export default AlertBell;
