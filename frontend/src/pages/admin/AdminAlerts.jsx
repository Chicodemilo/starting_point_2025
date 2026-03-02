import React, { useEffect, useState } from 'react';
import { getAdminAlerts, createAdminAlert } from '../../api/alerts';

function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', type: 'system', group_id: '', receiver_id: '', is_urgent: false });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAdminAlerts();
      setAlerts(data.alerts || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      content: form.content,
      type: form.type,
      is_urgent: form.is_urgent,
    };
    if (form.group_id) payload.group_id = parseInt(form.group_id);
    if (form.receiver_id) payload.receiver_id = parseInt(form.receiver_id);
    await createAdminAlert(payload);
    setForm({ title: '', content: '', type: 'system', group_id: '', receiver_id: '', is_urgent: false });
    fetchAlerts();
  };

  const readRate = alerts.length ? Math.round((alerts.filter(a => a.viewed).length / alerts.length) * 100) : 0;

  return (
    <div>
      <h1>Alerts</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={miniStat}><strong>{alerts.length}</strong><span>Total Sent</span></div>
        <div style={miniStat}><strong>{alerts.filter(a => a.viewed).length}</strong><span>Read</span></div>
        <div style={miniStat}><strong>{readRate}%</strong><span>Read Rate</span></div>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0 }}>Send Alert</h3>
        <form onSubmit={handleSend}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={inputStyle} />
          <textarea placeholder="Content (optional)" value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ ...inputStyle, height: '60px', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inputStyle}>
              <option value="system">System</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="urgent">Urgent</option>
            </select>
            <input placeholder="Group ID (optional)" value={form.group_id} onChange={e => setForm({...form, group_id: e.target.value})} style={inputStyle} />
            <input placeholder="User ID (optional)" value={form.receiver_id} onChange={e => setForm({...form, receiver_id: e.target.value})} style={inputStyle} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '14px' }}>
            <input type="checkbox" checked={form.is_urgent} onChange={e => setForm({...form, is_urgent: e.target.checked})} /> Urgent
          </label>
          <button type="submit" style={btnStyle}>Send Alert</button>
        </form>
      </div>

      {loading && <p>Loading...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Target</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Sent</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{alert.title}</td>
              <td style={tdStyle}><span style={{ ...typeBadge, backgroundColor: typeColors[alert.type] || '#95a5a6' }}>{alert.type}</span></td>
              <td style={tdStyle}>{alert.receiver_id ? `User #${alert.receiver_id}` : alert.group_id ? `Group #${alert.group_id}` : 'System-wide'}</td>
              <td style={tdStyle}>{alert.viewed ? 'Read' : 'Unread'}</td>
              <td style={tdStyle}>{new Date(alert.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const miniStat = { padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', fontSize: '14px', boxSizing: 'border-box' };
const btnStyle = { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const thStyle = { padding: '10px 8px', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };
const typeBadge = { padding: '2px 8px', color: 'white', borderRadius: '10px', fontSize: '11px' };
const typeColors = { info: '#3498db', warning: '#e67e22', urgent: '#e74c3c', system: '#9b59b6' };

export default AdminAlerts;
