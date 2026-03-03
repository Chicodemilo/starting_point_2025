// ==============================================================================
// File:      frontend/src/pages/Members.jsx
// Purpose:   Group members page. Shows the active group's member list with
//            roles and join dates. Contextual to the currently active group.
// Callers:   App.jsx (route: /members)
// Callees:   React, groupStore.js, api/groups.js, PageHeader.jsx, ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect, useState } from 'react';
import useGroupStore from '../store/groupStore';
import { getGroup } from '../api/groups';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

function Members() {
  const { activeGroup } = useGroupStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeGroup) { setLoading(false); return; }
    setLoading(true);
    getGroup(activeGroup.id)
      .then(group => setMembers(group.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [activeGroup?.id]);

  if (!activeGroup) {
    return (
      <div>
        <PageHeader title="Members" subtitle="Select an active group to view members." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${activeGroup.name} — ${members.length} member${members.length !== 1 ? 's' : ''}`}
      />

      <div style={contentArea}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        ) : members.length === 0 ? (
          <ContentCard style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>No members found.</p>
          </ContentCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map(member => (
              <ContentCard key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', marginBottom: '0' }}>
                <div style={avatarCircle}>
                  {member.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '500' }}>{member.username}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
                  </div>
                </div>
                <span style={{ ...roleBadge, backgroundColor: roleColors[member.role] || 'var(--bg-badge-neutral)' }}>
                  {member.role}
                </span>
              </ContentCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const avatarCircle = { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '600', flexShrink: 0 };
const roleBadge = { display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', color: 'var(--text-badge-neutral)', flexShrink: 0 };
const roleColors = { owner: 'var(--bg-badge-owner)', admin: 'var(--bg-badge-admin)', member: 'var(--bg-badge-member)' };

export default Members;
