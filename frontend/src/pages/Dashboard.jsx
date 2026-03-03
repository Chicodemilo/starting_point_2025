// ==============================================================================
// File:      frontend/src/pages/Dashboard.jsx
// Purpose:   Main user dashboard. Displays welcome message, summary stats,
//            and group list with active group selection.
// Callers:   App.jsx (route: /dashboard)
// Callees:   React, react-router-dom, authStore.js, groupStore.js,
//            itemStore.js, api/auth.js, PageHeader.jsx, ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useGroupStore from '../store/groupStore';
import useItemStore from '../store/itemStore';
import { setActiveGroup as apiSetActiveGroup } from '../api/auth';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

function Dashboard() {
  const { user, refreshProfile } = useAuthStore();
  const { groups, activeGroup, setActiveGroup, fetchGroups } = useGroupStore();
  const { items, fetchItems } = useItemStore();
  const navigate = useNavigate();
  const [settingActiveId, setSettingActiveId] = useState(null);

  useEffect(() => {
    fetchGroups();
    fetchItems({ userId: user?.id });
  }, []);

  const handleSetActive = async (e, group) => {
    e.stopPropagation();
    setSettingActiveId(group.id);
    try {
      await apiSetActiveGroup(group.id);
      setActiveGroup(group);
      await refreshProfile();
    } catch {
      // Silently fail — user can retry
    } finally {
      setSettingActiveId(null);
    }
  };

  const isActive = (group) => activeGroup?.id === group.id;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Welcome, ${user?.username}`} />

      <div style={contentArea}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <ContentCard style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px' }}>{groups.length}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Groups</p>
          </ContentCard>
          <ContentCard style={{ textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px' }}>{items.length}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Items</p>
          </ContentCard>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>My Groups</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate('/join')} style={secondaryBtn}>Join Group</button>
            <button onClick={() => navigate('/groups/create')} style={primaryBtn}>Create Group</button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div onClick={() => navigate('/groups/create')} style={{ cursor: 'pointer' }}>
              <ContentCard style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px', color: 'var(--brand-primary)' }}>+</div>
                <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>Create a Group</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Start your own group and invite others to join.</p>
                <button style={{ ...primaryBtn, marginTop: '16px' }}>Get Started</button>
              </ContentCard>
            </div>
            <div onClick={() => navigate('/join')} style={{ cursor: 'pointer' }}>
              <ContentCard style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', color: 'var(--brand-primary)' }}>&#8594;</div>
                <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)' }}>Join with Invite Code</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Have a code? Enter it to join an existing group.</p>
                <button style={{ ...secondaryBtn, marginTop: '16px' }}>Enter Code</button>
              </ContentCard>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groups.map(group => (
              <div key={group.id} onClick={() => navigate(`/groups/${group.id}`)} style={groupCard}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px 0' }}>{group.name}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.description}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>
                  <div style={{ width: '80px', textAlign: 'center' }}>
                    <span style={typeBadge}>{group.type}</span>
                  </div>
                  <div style={{ width: '70px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {group.is_private ? 'Private' : 'Public'}
                  </div>
                  <div style={{ width: '90px', textAlign: 'right' }}>
                    {isActive(group) ? (
                      <span style={activeBadge}>Active</span>
                    ) : (
                      <button
                        onClick={(e) => handleSetActive(e, group)}
                        disabled={settingActiveId === group.id}
                        style={setActiveBtn}
                      >
                        {settingActiveId === group.id ? '...' : 'Set Active'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const groupCard = { display: 'flex', alignItems: 'center', padding: '16px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-primary)', cursor: 'pointer', gap: '16px' };
const typeBadge = { display: 'inline-block', padding: '6px 16px', backgroundColor: 'var(--bg-badge-neutral)', borderRadius: '14px', fontSize: '13px', fontWeight: '500', color: 'var(--text-badge-neutral)' };
const primaryBtn = { padding: '10px 20px', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };
const secondaryBtn = { padding: '10px 20px', backgroundColor: 'var(--bg-surface)', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };
const setActiveBtn = { padding: '6px 14px', backgroundColor: 'var(--bg-surface)', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' };
const activeBadge = { display: 'inline-block', padding: '6px 14px', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' };

export default Dashboard;
