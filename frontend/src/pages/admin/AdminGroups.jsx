import React, { useEffect, useState } from 'react';
import useAdminStore from '../../store/adminStore';
import { deleteAdminGroup } from '../../api/admin';

function AdminGroups() {
  const { groups, fetchGroups, loading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { fetchGroups({ search, type: typeFilter }); }, [search, typeFilter]);

  const handleDelete = async (groupId, name) => {
    if (window.confirm(`Delete group "${name}"? This cannot be undone.`)) {
      await deleteAdminGroup(groupId);
      fetchGroups({ search, type: typeFilter });
    }
  };

  return (
    <div>
      <h1>Groups</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
          <option value="">All Types</option>
          <option value="club">Club</option>
          <option value="team">Team</option>
          <option value="league">League</option>
          <option value="group">Group</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Visibility</th>
            <th style={thStyle}>Owner</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{group.id}</td>
              <td style={tdStyle}>{group.name}</td>
              <td style={tdStyle}><span style={typeBadge}>{group.type}</span></td>
              <td style={tdStyle}>{group.is_private ? 'Private' : 'Public'}</td>
              <td style={tdStyle}>{group.owner_id}</td>
              <td style={tdStyle}>
                <button onClick={() => handleDelete(group.id, group.name)} style={deleteBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { padding: '12px 8px', color: '#7f8c8d', fontSize: '13px', textTransform: 'uppercase' };
const tdStyle = { padding: '12px 8px' };
const typeBadge = { display: 'inline-block', padding: '2px 10px', backgroundColor: '#e9ecef', borderRadius: '12px', fontSize: '13px' };
const deleteBtn = { padding: '4px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };

export default AdminGroups;
