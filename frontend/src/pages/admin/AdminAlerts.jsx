// ==============================================================================
// File:      frontend/src/pages/admin/AdminAlerts.jsx
// Purpose:   Admin alerts management page. Displays alert statistics, a
//            form to send new system/targeted alerts, and a table listing
//            all alerts with type, target, read status, and date.
// Callers:   AdminLayout.jsx
// Callees:   React, api/alerts.js
// Modified:  2026-03-01
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { getAdminAlerts, createAdminAlert } from '../../api/alerts';

function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', type: 'system', group_id: '', receiver_id: '', is_urgent: false });

  const fetchAlerts = async () => {
    setLoading(true);
    try { const data = await getAdminAlerts(); setAlerts(data.alerts || []); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const payload = { title: form.title, content: form.content, type: form.type, is_urgent: form.is_urgent };
    if (form.group_id) payload.group_id = parseInt(form.group_id);
    if (form.receiver_id) payload.receiver_id = parseInt(form.receiver_id);
    await createAdminAlert(payload);
    setForm({ title: '', content: '', type: 'system', group_id: '', receiver_id: '', is_urgent: false });
    fetchAlerts();
  };

  const readRate = alerts.length ? Math.round((alerts.filter(a => a.viewed).length / alerts.length) * 100) : 0;

  return (
    <div>
      <h1 style={t.h1}><span style={t.prompt}>$</span> alerts</h1>

      <div style={t.statsRow}>
        <div style={t.stat}><span style={t.statVal}>{alerts.length}</span> total</div>
        <div style={t.stat}><span style={t.statVal}>{alerts.filter(a => a.viewed).length}</span> read</div>
        <div style={t.stat}><span style={t.statVal}>{readRate}%</span> rate</div>
      </div>

      <div style={t.section}>
        <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '8px' }}>send_alert:</div>
        <form onSubmit={handleSend}>
          <input placeholder="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={t.input} />
          <textarea placeholder="content (optional)" value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ ...t.input, height: '50px', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={t.input}>
              <option value="system">system</option>
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="urgent">urgent</option>
            </select>
            <input placeholder="group_id" value={form.group_id} onChange={e => setForm({...form, group_id: e.target.value})} style={t.input} />
            <input placeholder="user_id" value={form.receiver_id} onChange={e => setForm({...form, receiver_id: e.target.value})} style={t.input} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', color: '#9ca3af' }}>
            <input type="checkbox" checked={form.is_urgent} onChange={e => setForm({...form, is_urgent: e.target.checked})} /> urgent
          </label>
          <button type="submit" style={t.submitBtn}>{'>'} send</button>
        </form>
      </div>

      {loading && <p style={t.muted}>loading...</p>}

      <table style={t.table}>
        <thead><tr>{['title', 'type', 'target', 'status', 'sent'].map(h => <th key={h} style={t.th}>{h}</th>)}</tr></thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert.id} style={t.tr}>
              <td style={t.td}>{alert.title}</td>
              <td style={t.td}><span style={{ color: typeColors[alert.type] || '#6b7280' }}>{alert.type}</span></td>
              <td style={t.td}>{alert.receiver_id ? `user:${alert.receiver_id}` : alert.group_id ? `group:${alert.group_id}` : 'system'}</td>
              <td style={t.td}><span style={{ color: alert.viewed ? '#4ade80' : '#6b7280' }}>{alert.viewed ? 'read' : 'unread'}</span></td>
              <td style={t.td}>{new Date(alert.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const typeColors = { info: '#60a5fa', warning: '#f59e0b', urgent: '#ef4444', system: '#a78bfa' };
const t = {
  h1: { fontSize: '18px', color: '#4ade80', fontWeight: 'normal', margin: '0 0 20px', fontFamily: 'inherit' },
  prompt: { color: '#4ade80' },
  muted: { color: '#6b7280', fontSize: '13px' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '20px' },
  stat: { fontSize: '13px', color: '#6b7280' },
  statVal: { color: '#4ade80', marginRight: '4px' },
  section: { padding: '16px', backgroundColor: '#111111', border: '1px solid #1f1f1f', marginBottom: '20px' },
  input: { width: '100%', padding: '8px 12px', backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a', color: '#d1d5db', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '8px' },
  submitBtn: { padding: '8px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#4ade80', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '8px', color: '#6b7280', fontSize: '11px', textAlign: 'left', borderBottom: '1px solid #1f1f1f', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #1a1a1a' },
  td: { padding: '8px', fontSize: '13px', color: '#d1d5db' },
};

export default AdminAlerts;
