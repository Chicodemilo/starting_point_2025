// ==============================================================================
// File:      frontend/src/pages/admin/AdminMessages.jsx
// Purpose:   Admin messaging overview page. Shows conversation and message
//            counts, provides a broadcast form for system-wide messages,
//            and lists all conversations with member and message stats.
// Callers:   AdminLayout.jsx
// Callees:   React, api/conversations.js
// Modified:  2026-03-01
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { getAdminConversations, adminBroadcast } from '../../api/conversations';

function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', content: '' });

  const fetchConversations = async () => {
    setLoading(true);
    try { const data = await getAdminConversations(); setConversations(data.conversations || []); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchConversations(); }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    await adminBroadcast(broadcastForm);
    setBroadcastForm({ title: '', content: '' });
  };

  const totalMessages = conversations.reduce((sum, c) => sum + (c.message_count || 0), 0);

  return (
    <div>
      <h1 style={t.h1}><span style={t.prompt}>$</span> messages</h1>

      <div style={t.statsRow}>
        <div style={t.stat}><span style={t.statVal}>{conversations.length}</span> conversations</div>
        <div style={t.stat}><span style={t.statVal}>{totalMessages}</span> messages</div>
      </div>

      <div style={t.section}>
        <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>broadcast:</div>
        <form onSubmit={handleBroadcast}>
          <input placeholder="title" value={broadcastForm.title} onChange={e => setBroadcastForm({...broadcastForm, title: e.target.value})} required style={t.input} />
          <textarea placeholder="content" value={broadcastForm.content} onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})} style={{ ...t.input, height: '50px' }} />
          <button type="submit" style={t.submitBtn}>> broadcast</button>
        </form>
      </div>

      {loading && <p style={t.muted}>loading...</p>}

      <table style={t.table}>
        <thead><tr>{['id', 'type', 'name', 'members', 'messages'].map(h => <th key={h} style={t.th}>{h}</th>)}</tr></thead>
        <tbody>
          {conversations.map(c => (
            <tr key={c.id} style={t.tr}>
              <td style={t.td}>{c.id}</td>
              <td style={t.td}>{c.type}</td>
              <td style={t.td}>{c.name || 'dm'}</td>
              <td style={t.td}>{c.member_count}</td>
              <td style={t.td}>{c.message_count}</td>
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
  statsRow: { display: 'flex', gap: '16px', marginBottom: '20px' },
  stat: { fontSize: '13px', color: '#6b7280' },
  statVal: { color: '#4ade80', marginRight: '4px' },
  section: { padding: '16px', backgroundColor: '#111111', border: '1px solid #1f1f1f', marginBottom: '20px' },
  input: { width: '100%', padding: '8px 12px', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', color: '#d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '8px' },
  submitBtn: { padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#a78bfa', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '8px', color: '#6b7280', fontSize: '11px', textAlign: 'left', borderBottom: '1px solid #1f1f1f', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #1a1a1a' },
  td: { padding: '8px', fontSize: '13px', color: '#d1d5db' },
};

export default AdminMessages;
