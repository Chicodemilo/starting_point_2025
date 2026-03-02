import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useGroupStore from '../store/groupStore';
import { setActiveGroup } from '../api/auth';

function GroupPicker() {
  const { user, refreshProfile } = useAuthStore();
  const { groups, fetchGroups, loading } = useGroupStore();
  const navigate = useNavigate();

  useEffect(() => { fetchGroups(); }, []);

  const handleSetActive = async (groupId) => {
    await setActiveGroup(groupId);
    await refreshProfile();
  };

  const handleClear = async () => {
    await setActiveGroup(null);
    await refreshProfile();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Select Active Group</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '24px' }}>
        Choose a group to use as your active context for alerts and messaging.
      </p>

      {user?.active_group_id && (
        <button onClick={handleClear} style={{ marginBottom: '16px', padding: '8px 16px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Clear Active Group
        </button>
      )}

      {loading && <p>Loading groups...</p>}

      {groups.length === 0 && !loading ? (
        <p>No groups yet. <a href="/groups">Create or join one.</a></p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {groups.map(group => (
            <div key={group.id} style={{
              ...groupRow,
              borderColor: user?.active_group_id === group.id ? '#3498db' : '#dee2e6',
              borderWidth: user?.active_group_id === group.id ? '2px' : '1px',
            }}>
              <div>
                <strong>{group.name}</strong>
                <span style={{ color: '#7f8c8d', marginLeft: '8px', fontSize: '13px' }}>{group.type}</span>
                {user?.active_group_id === group.id && (
                  <span style={{ marginLeft: '8px', backgroundColor: '#3498db', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>Active</span>
                )}
              </div>
              {user?.active_group_id !== group.id && (
                <button onClick={() => handleSetActive(group.id)} style={{ padding: '6px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                  Set Active
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: '24px' }}>
        <a href="/dashboard">Back to Dashboard</a>
      </p>
    </div>
  );
}

const groupRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', borderStyle: 'solid' };

export default GroupPicker;
