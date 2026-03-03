// ==============================================================================
// File:      frontend/src/pages/GroupDetail.jsx
// Purpose:   Group detail page. Shows group name, icon, type, visibility,
//            invite code, and member list. Provides a manage link for
//            the group owner.
// Callers:   App.jsx (route: /groups/:id)
// Callees:   React, react-router-dom, groupStore.js, authStore.js,
//            PageHeader.jsx, ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5151';

function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentGroup, fetchGroup, loading } = useGroupStore();

  useEffect(() => { fetchGroup(id); }, [id]);

  if (loading || !currentGroup) return <div style={{ padding: '20px' }}>Loading...</div>;

  const manageBtn = currentGroup.owner_id === user?.id ? (
    <button onClick={() => navigate(`/groups/${id}/admin`)}
      style={{ padding: '8px 16px', backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
      Manage Group
    </button>
  ) : null;

  const subtitle = `${currentGroup.type} · ${currentGroup.is_private ? 'Private' : 'Public'}`;

  return (
    <div>
      <PageHeader title={currentGroup.name} subtitle={subtitle} action={manageBtn} />

      <div style={contentArea}>
        {currentGroup.description && (
          <ContentCard>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{currentGroup.description}</p>
          </ContentCard>
        )}

        {currentGroup.invite_code && (
          <ContentCard style={{ backgroundColor: 'var(--bg-highlight)' }}>
            <strong>Invite Code:</strong> <code style={{ fontSize: '18px', marginLeft: '8px' }}>{currentGroup.invite_code}</code>
          </ContentCard>
        )}

        <h3 style={{ margin: '24px 0 12px', fontSize: '16px', color: 'var(--text-primary)' }}>Members ({currentGroup.members?.length || 0})</h3>
        <ContentCard style={{ padding: 0 }}>
          {currentGroup.members?.map((member, i) => (
            <div key={member.id} style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: i < currentGroup.members.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <span>{member.username}</span>
              <span style={roleBadge}>{member.role}</span>
            </div>
          ))}
        </ContentCard>
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const roleBadge = { padding: '2px 8px', backgroundColor: 'var(--bg-badge-role)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-badge-role)' };

export default GroupDetail;
