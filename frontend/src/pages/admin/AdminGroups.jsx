// ==============================================================================
// File:      frontend/src/pages/admin/AdminGroups.jsx
// Purpose:   Admin group management page. Lists all groups with search
//            and type filter, displays group metadata, and provides
//            group deletion functionality.
// Callers:   AdminLayout.jsx
// Callees:   React, adminStore.js, api/admin.js
// Modified:  2026-03-01
// ==============================================================================
import React, { useEffect, useState } from 'react';
import useAdminStore from '../../store/adminStore';
import { deleteAdminGroup } from '../../api/admin';

function AdminGroups() {
  const { groups, fetchGroups, loading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { fetchGroups({ search, type: typeFilter }); }, [search, typeFilter]);

  const handleDelete = async (groupId, name) => {
    if (window.confirm(`Delete group "${name}"?`)) {
      await deleteAdminGroup(groupId);
      fetchGroups({ search, type: typeFilter });
    }
  };

  return (
    <div>
      <h1 style={t.h1}><span style={t.prompt}>$</span> groups</h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input type="text" placeholder="search..." value={search} onChange={(e) => setSearch(e.target.value)} style={t.input} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={t.input}>
          <option value="">all types</option>
          <option value="club">club</option>
          <option value="team">team</option>
          <option value="league">league</option>
          <option value="group">group</option>
        </select>
      </div>

      {loading && <p style={t.muted}>loading...</p>}

      <table style={t.table}>
        <thead>
          <tr>
            {['id', 'name', 'type', 'visibility', 'owner', 'actions'].map(h => (
              <th key={h} style={t.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <tr key={group.id} style={t.tr}>
              <td style={t.td}>{group.id}</td>
              <td style={t.td}>{group.name}</td>
              <td style={t.td}><span style={t.typeBadge}>{group.type}</span></td>
              <td style={t.td}>{group.is_private ? 'private' : 'public'}</td>
              <td style={t.td}>{group.owner_id}</td>
              <td style={t.td}>
                <button onClick={() => handleDelete(group.id, group.name)} style={t.action}>[del]</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const t = {
  h1: { fontSize: '18px', color: '#4ade80', fontWeight: 'normal', margin: '0 0 20px', fontFamily: 'inherit' },
  prompt: { color: '#4ade80' },
  muted: { color: '#6b7280', fontSize: '13px' },
  input: { flex: 1, padding: '8px 12px', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', color: '#d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '8px', color: '#6b7280', fontSize: '11px', textAlign: 'left', borderBottom: '1px solid #1f1f1f', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #1a1a1a' },
  td: { padding: '8px', fontSize: '13px', color: '#d1d5db' },
  typeBadge: { color: '#9ca3af' },
  action: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', color: '#ef4444', padding: 0 },
};

export default AdminGroups;
