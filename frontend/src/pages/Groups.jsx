// ==============================================================================
// File:      frontend/src/pages/Groups.jsx
// Purpose:   Groups listing page. Displays the user's groups with type
//            and visibility badges, and provides buttons to create a new
//            group or join an existing one via invite code. Allows setting
//            a group as the active group.
// Callers:   App.jsx (route: /groups)
// Callees:   React, react-router-dom, groupStore.js, authStore.js, api/auth.js
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import { setActiveGroup as apiSetActiveGroup } from '../api/auth';

function Groups() {
  const { groups, activeGroup, setActiveGroup, fetchGroups, loading } = useGroupStore();
  const { user, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const [settingActiveId, setSettingActiveId] = useState(null);

  useEffect(() => { fetchGroups(); }, []);

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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>My Groups</h1>
        <button onClick={() => navigate('/groups/create')} style={primaryBtn}>Create Group</button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && groups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <h3>No groups yet</h3>
          <p>Create a new group or join one via invite link.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {groups.map(group => (
          <div key={group.id} onClick={() => navigate(`/groups/${group.id}`)} style={groupCard}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: '0 0 4px 0' }}>{group.name}</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{group.description}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={typeBadge}>{group.type}</span>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {group.is_private ? 'Private' : 'Public'}
                </span>
              </div>
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
        ))}
      </div>
    </div>
  );
}

const groupCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-primary)', cursor: 'pointer' };
const typeBadge = { display: 'inline-block', padding: '2px 10px', backgroundColor: 'var(--bg-badge-neutral)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-badge-neutral)' };
const primaryBtn = { padding: '10px 20px', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };

const setActiveBtn = { padding: '6px 14px', backgroundColor: 'var(--bg-surface)', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' };
const activeBadge = { display: 'inline-block', padding: '6px 14px', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', borderRadius: '6px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' };

export default Groups;
