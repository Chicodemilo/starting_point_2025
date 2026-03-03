// ==============================================================================
// File:      frontend/src/pages/Inbox.jsx
// Purpose:   Unified inbox page with tabbed views for alerts and messages.
//            Displays alert notifications with mark-read and delete
//            actions, and lists conversations with unread badges.
// Callers:   App.jsx (route: /inbox)
// Callees:   React, react-router-dom, alertStore.js, messagingStore.js,
//            PageHeader.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAlertStore from '../store/alertStore';
import useMessagingStore from '../store/messagingStore';
import PageHeader from '../components/PageHeader';

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
    <div>
      <PageHeader title="Inbox" />

      <div style={contentArea}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border-primary)', marginBottom: '20px' }}>
          <button onClick={() => setTab('alerts')} style={{ ...tabStyle, borderBottomColor: tab === 'alerts' ? 'var(--brand-primary)' : 'transparent', color: tab === 'alerts' ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
            Alerts {alerts.filter(a => !a.viewed).length > 0 && <span style={tabBadge}>{alerts.filter(a => !a.viewed).length}</span>}
          </button>
          <button onClick={() => setTab('messages')} style={{ ...tabStyle, borderBottomColor: tab === 'messages' ? 'var(--brand-primary)' : 'transparent', color: tab === 'messages' ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
            Messages {conversations.reduce((s, c) => s + (c.unread_count || 0), 0) > 0 && <span style={tabBadge}>{conversations.reduce((s, c) => s + (c.unread_count || 0), 0)}</span>}
          </button>
        </div>

        {/* Alerts Tab */}
        {tab === 'alerts' && (
          <div>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No alerts</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} style={{ ...alertRow, backgroundColor: alert.viewed ? 'var(--bg-surface)' : 'var(--bg-hover)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ ...typeBadge, backgroundColor: typeColors[alert.type] || 'var(--text-faint)' }}>{alert.type}</span>
                      <strong>{alert.title}</strong>
                    </div>
                    {alert.content && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>{alert.content}</p>}
                    <p style={{ margin: '4px 0 0', color: 'var(--border-input)', fontSize: '12px' }}>{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {!alert.viewed && <button onClick={() => markRead(alert.id)} style={smallBtn}>Mark Read</button>}
                    <button onClick={() => removeAlert(alert.id)} style={{ ...smallBtn, backgroundColor: 'var(--brand-danger)' }}>Delete</button>
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
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No conversations</p>
            ) : (
              conversations.map(conv => (
                <div key={conv.id} onClick={() => navigate(`/inbox/conversation/${conv.id}`)} style={convRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{conv.name || 'Direct Message'}</strong>
                      {conv.unread_count > 0 && <span style={unreadBadge}>{conv.unread_count}</span>}
                    </div>
                    {conv.last_message && (
                      <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {conv.last_message.sender_username}: {conv.last_message.content.substring(0, 50)}{conv.last_message.content.length > 50 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <span style={{ color: 'var(--border-input)', fontSize: '12px' }}>{conv.type}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const tabStyle = { padding: '10px 20px', border: 'none', borderBottom: '3px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '15px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' };
const tabBadge = { backgroundColor: 'var(--brand-danger)', color: 'var(--text-on-brand)', borderRadius: '50%', width: '20px', height: '20px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const alertRow = { padding: '14px', borderRadius: '8px', border: '1px solid var(--border-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const typeBadge = { padding: '2px 8px', color: 'var(--text-on-brand)', borderRadius: '10px', fontSize: '11px' };
const typeColors = { info: 'var(--brand-primary)', warning: 'var(--brand-warning)', urgent: 'var(--brand-danger)', system: 'var(--brand-purple)' };
const smallBtn = { padding: '4px 10px', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const convRow = { padding: '14px', borderRadius: '8px', border: '1px solid var(--border-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' };
const unreadBadge = { backgroundColor: 'var(--brand-danger)', color: 'var(--text-on-brand)', borderRadius: '50%', minWidth: '18px', height: '18px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' };

export default Inbox;
