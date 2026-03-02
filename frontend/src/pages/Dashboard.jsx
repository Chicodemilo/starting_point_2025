// ==============================================================================
// File:      frontend/src/pages/Dashboard.jsx
// Purpose:   Main user dashboard. Displays summary stats for groups and
//            items, active group status, unread alert and message counts,
//            and a list of the user's groups.
// Callers:   App.jsx (route: /dashboard)
// Callees:   React, authStore.js, groupStore.js, itemStore.js,
//            alertStore.js, messagingStore.js
// Modified:  2026-03-01
// ==============================================================================
import React, { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useGroupStore from '../store/groupStore';
import useItemStore from '../store/itemStore';
import useAlertStore from '../store/alertStore';
import useMessagingStore from '../store/messagingStore';

function Dashboard() {
  const { user } = useAuthStore();
  const { groups, fetchGroups } = useGroupStore();
  const { items, fetchItems } = useItemStore();
  const { unreadCount: alertUnread, fetchUnreadCount: fetchAlertUnread } = useAlertStore();
  const { conversations, fetchConversations } = useMessagingStore();

  useEffect(() => {
    fetchGroups();
    fetchItems({ userId: user?.id });
    fetchAlertUnread();
    fetchConversations();
  }, []);

  const messageUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  const totalUnread = alertUnread + messageUnread;
  const activeGroup = groups.find(g => g.id === user?.active_group_id);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: '#7f8c8d' }}>Welcome, {user?.username}</p>
        </div>
        <a href="/inbox" style={bellStyle}>
          &#128276;
          {totalUnread > 0 && <span style={badgeStyle}>{totalUnread}</span>}
        </a>
      </div>

      {/* Active Group Prompt */}
      {!user?.active_group_id ? (
        <div style={{ padding: '16px', backgroundColor: '#fff3cd', borderRadius: '8px', margin: '16px 0', border: '1px solid #ffc107' }}>
          <strong>No active group selected.</strong>{' '}
          <a href="/group-picker">Pick a group</a> to enable alerts and messaging.
        </div>
      ) : (
        <div style={{ padding: '12px 16px', backgroundColor: '#d4edda', borderRadius: '8px', margin: '16px 0', border: '1px solid #28a745', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Active group: <strong>{activeGroup?.name || `Group #${user.active_group_id}`}</strong></span>
          <a href="/group-picker" style={{ fontSize: '13px', color: '#155724' }}>Change</a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '24px 0' }}>
        <div style={statCard}><h2>{groups.length}</h2><p>Groups</p></div>
        <div style={statCard}><h2>{items.length}</h2><p>Items</p></div>
      </div>

      <h2>My Groups</h2>
      {groups.length === 0 ? (
        <p>No groups yet. <a href="/groups">Create or join one.</a></p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {groups.map(g => (
            <li key={g.id} style={listItem}>
              <strong>{g.name}</strong>
              <span style={{ color: '#7f8c8d', marginLeft: '8px' }}>{g.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const statCard = { padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center', border: '1px solid #dee2e6' };
const listItem = { padding: '12px 16px', borderBottom: '1px solid #eee' };
const bellStyle = { position: 'relative', fontSize: '28px', textDecoration: 'none', cursor: 'pointer' };
const badgeStyle = { position: 'absolute', top: '-6px', right: '-10px', backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };

export default Dashboard;
