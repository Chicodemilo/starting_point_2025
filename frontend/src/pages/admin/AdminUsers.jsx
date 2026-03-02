import React, { useEffect, useState } from 'react';
import useAdminStore from '../../store/adminStore';
import { updateUser, deleteUser } from '../../api/admin';

function AdminUsers() {
  const { users, fetchUsers, loading } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers({ search }); }, [search]);

  const handleToggleAdmin = async (userId, currentStatus) => {
    await updateUser(userId, { is_admin: !currentStatus });
    fetchUsers({ search });
  };

  const handleToggleVerified = async (userId, currentStatus) => {
    await updateUser(userId, { email_verified: !currentStatus });
    fetchUsers({ search });
  };

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Delete user "${username}"? This cannot be undone.`)) {
      await deleteUser(userId);
      fetchUsers({ search });
    }
  };

  return (
    <div>
      <h1>Users</h1>

      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' }}
      />

      {loading && <p>Loading...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Username</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Verified</th>
            <th style={thStyle}>Admin</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{user.id}</td>
              <td style={tdStyle}>{user.username}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>
                <button onClick={() => handleToggleVerified(user.id, user.email_verified)} style={{ ...badgeStyle, backgroundColor: user.email_verified ? '#27ae60' : '#e67e22' }}>
                  {user.email_verified ? 'Verified' : 'Unverified'}
                </button>
              </td>
              <td style={tdStyle}>
                <button onClick={() => handleToggleAdmin(user.id, user.is_admin)} style={{ ...badgeStyle, backgroundColor: user.is_admin ? '#27ae60' : '#95a5a6' }}>
                  {user.is_admin ? 'Yes' : 'No'}
                </button>
              </td>
              <td style={tdStyle}>
                <button onClick={() => handleDelete(user.id, user.username)} style={deleteBtn}>Delete</button>
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
const badgeStyle = { padding: '4px 12px', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '12px' };
const deleteBtn = { padding: '4px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };

export default AdminUsers;
