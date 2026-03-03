// ==============================================================================
// File:      frontend/src/pages/Activity.jsx
// Purpose:   Group activity feed. Shows a chronological log of events for
//            the active group. Placeholder for app-specific activity types.
// Callers:   App.jsx (route: /activity)
// Callees:   React, groupStore.js, PageHeader.jsx, ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React from 'react';
import useGroupStore from '../store/groupStore';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

function Activity() {
  const { activeGroup } = useGroupStore();

  if (!activeGroup) {
    return (
      <div>
        <PageHeader title="Activity" subtitle="Select an active group to view activity." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Activity" subtitle={activeGroup.name} />

      <div style={contentArea}>
        <ContentCard style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>~</div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--text-faint)' }}>No activity yet</h3>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Group activity will appear here as members interact.</p>
        </ContentCard>
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };

export default Activity;
