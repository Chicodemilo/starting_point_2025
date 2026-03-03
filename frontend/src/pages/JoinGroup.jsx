// ==============================================================================
// File:      frontend/src/pages/JoinGroup.jsx
// Purpose:   Join-by-invite-code page. Provides a prominent input for entering
//            an 8-character invite code. Submits via groupStore and navigates
//            to the joined group's detail page on success.
// Callers:   App.jsx (route: /join)
// Callees:   React, react-router-dom, groupStore.js, PageHeader.jsx,
//            ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

function JoinGroup() {
  const navigate = useNavigate();
  const { joinGroup, loading } = useGroupStore();

  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    try {
      const group = await joinGroup(code.trim());
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join group');
    }
  };

  return (
    <div>
      <PageHeader title="Join Group" subtitle="Enter an invite code to join an existing group" />

      <div style={contentArea}>
        <ContentCard style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 24px' }}>
            Ask a group admin for their invite code, then paste it below.
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              maxLength={8}
              style={codeInput}
              autoFocus
            />

            {error && <p style={errorStyle}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' }}>
              <button type="submit" disabled={loading || !code.trim()} style={{ ...btnPrimary, opacity: loading || !code.trim() ? 0.5 : 1 }}>
                {loading ? 'Joining...' : 'Join Group'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} style={btnSecondary}>
                Cancel
              </button>
            </div>
          </form>
        </ContentCard>
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const codeInput = { width: '100%', padding: '16px', borderRadius: '8px', border: '2px solid var(--border-input-light)', fontSize: '24px', textAlign: 'center', letterSpacing: '4px', fontFamily: 'monospace', fontWeight: '600', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', boxSizing: 'border-box' };
const btnPrimary = { padding: '10px 24px', color: 'var(--text-on-brand)', backgroundColor: 'var(--brand-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const btnSecondary = { padding: '10px 24px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-badge-neutral)', border: '1px solid var(--border-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };
const errorStyle = { color: 'var(--brand-danger)', fontSize: '14px', margin: '12px 0 0', padding: '8px 12px', backgroundColor: 'var(--bg-danger-subtle, rgba(220,53,69,0.1))', borderRadius: '6px' };

export default JoinGroup;
