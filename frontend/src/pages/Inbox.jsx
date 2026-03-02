import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAlertStore from '../store/alertStore';
import useMessagingStore from '../store/messagingStore';

function Inbox() {
  const [tab, setTab] = useState('alerts');
  const { alerts, fetchAlerts, markRead, removeAlert } = useAlertStore();
  const { conversations, fetchConversations } = useMessagingStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    fetchConversations();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Inbox</h1>
        <a href="/dashboard" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>Back to Dashboard</a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #dee2e6', marginBottom: '20px' }}>
        <button onClick={() => setTab('alerts')} style={{ ...tabStyle, borderBottomColor: tab === 'alerts' ? '#3498db' : 'transparent', color: tab === 'alerts' ? '#3498db' : '#7f8c8d' }}>
          Alerts {alerts.filter(a => !a.viewed).length > 0 && <span style={tabBadge}>{alerts.filter(a => !a.viewed).length}</span>}
        </button>
        <button onClick={() => setTab('messages')} style={{ ...tabStyle, borderBottomColor: tab === 'messages' ? '#3498db' : 'transparent', color: tab === 'messages' ? '#3498db' : '#7f8c8d' }}>
          Messages {conversations.reduce((s, c) => s + (c.unread_count || 0), 0) > 0 && <span style={tabBadge}>{conversations.reduce((s, c) => s + (c.unread_count || 0), 0)}</span>}
        </button>
      </div>

      {/* Alerts Tab */}
      {tab === 'alerts' && (
        <div>
          {alerts.length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px 0' }}>No alerts</p>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} style={{ ...alertRow, backgroundColor: alert.viewed ? '#fff' : '#f0f7ff' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ ...typeBadge, backgroundColor: typeColors[alert.type] || '#95a5a6' }}>{alert.type}</span>
                    <strong>{alert.title}</strong>
                  </div>
                  {alert.content && <p style={{ margin: 0, color: '#7f8c8d', fontSize: '13px' }}>{alert.content}</p>}
                  <p style={{ margin: '4px 0 0', color: '#bdc3c7', fontSize: '12px' }}>{new Date(alert.created_at).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {!alert.viewed && <button onClick={() => markRead(alert.id)} style={smallBtn}>Mark Read</button>}
                  <button onClick={() => removeAlert(alert.id)} style={{ ...smallBtn, backgroundColor: '#e74c3c' }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages Tab */}
      {tab === 'messages' && (
        <div>
          {conversations.length === 0 ? (
            <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px 0' }}>No conversations</p>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} onClick={() => navigate(`/inbox/conversation/${conv.id}`)} style={convRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>{conv.name || 'Direct Message'}</strong>
                    {conv.unread_count > 0 && <span style={unreadBadge}>{conv.unread_count}</span>}
                  </div>
                  {conv.last_message && (
                    <p style={{ margin: '4px 0 0', color: '#7f8c8d', fontSize: '13px' }}>
                      {conv.last_message.sender_username}: {conv.last_message.content.substring(0, 50)}{conv.last_message.content.length > 50 ? '...' : ''}
                    </p>
                  )}
                </div>
                <span style={{ color: '#bdc3c7', fontSize: '12px' }}>{conv.type}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const tabStyle = { padding: '10px 20px', border: 'none', borderBottom: '3px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' };
const tabBadge = { backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const alertRow = { padding: '14px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const typeBadge = { padding: '2px 8px', color: 'white', borderRadius: '10px', fontSize: '11px' };
const typeColors = { info: '#3498db', warning: '#e67e22', urgent: '#e74c3c', system: '#9b59b6' };
const smallBtn = { padding: '4px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const convRow = { padding: '14px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' };
const unreadBadge = { backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', minWidth: '18px', height: '18px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' };

export default Inbox;
