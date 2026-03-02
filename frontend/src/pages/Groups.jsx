// ==============================================================================
// File:      frontend/src/pages/Groups.jsx
// Purpose:   Groups listing page. Displays the user's groups with type
//            and visibility badges, and provides buttons to create a new
//            group or join an existing one via invite code.
// Callers:   App.jsx (route: /groups)
// Callees:   React, react-router-dom, groupStore.js
// Modified:  2026-03-01
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';

function Groups() {
  const { groups, fetchGroups, loading } = useGroupStore();
  const navigate = useNavigate();

  useEffect(() => { fetchGroups(); }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>My Groups</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/groups/join')} style={secondaryBtn}>Join Group</button>
          <button onClick={() => navigate('/groups/create')} style={primaryBtn}>Create Group</button>
        </div>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && groups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7f8c8d' }}>
          <h3>No groups yet</h3>
          <p>Create a new group or join one with an invite code.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {groups.map(group => (
          <div key={group.id} onClick={() => navigate(`/groups/${group.id}`)} style={groupCard}>
            <div>
              <h3 style={{ margin: '0 0 4px 0' }}>{group.name}</h3>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>{group.description}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={typeBadge}>{group.type}</span>
              <span style={{ display: 'block', fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                {group.is_private ? 'Private' : 'Public'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const groupCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', cursor: 'pointer' };
const typeBadge = { display: 'inline-block', padding: '2px 10px', backgroundColor: '#e9ecef', borderRadius: '12px', fontSize: '13px', color: '#495057' };
const primaryBtn = { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };
const secondaryBtn = { padding: '10px 20px', backgroundColor: '#fff', color: '#3498db', border: '1px solid #3498db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };

export default Groups;
