import React, { useEffect, useState } from 'react';
import { getAdminConversations, adminBroadcast } from '../../api/conversations';

function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', content: '' });

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = await getAdminConversations();
      setConversations(data.conversations || []);
    } catch { /* ignore */ }
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
      <h1>Messages</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={miniStat}><strong>{conversations.length}</strong><span>Conversations</span></div>
        <div style={miniStat}><strong>{totalMessages}</strong><span>Total Messages</span></div>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0 }}>System Broadcast</h3>
        <form onSubmit={handleBroadcast}>
          <input placeholder="Title" value={broadcastForm.title} onChange={e => setBroadcastForm({...broadcastForm, title: e.target.value})} required style={inputStyle} />
          <textarea placeholder="Content" value={broadcastForm.content} onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})} style={{ ...inputStyle, height: '60px' }} />
          <button type="submit" style={btnStyle}>Send Broadcast</button>
        </form>
      </div>

      {loading && <p>Loading...</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Members</th>
            <th style={thStyle}>Messages</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tdStyle}>{c.id}</td>
              <td style={tdStyle}>{c.type}</td>
              <td style={tdStyle}>{c.name || 'Direct Message'}</td>
              <td style={tdStyle}>{c.member_count}</td>
              <td style={tdStyle}>{c.message_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const miniStat = { padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' };
const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px', fontSize: '14px', boxSizing: 'border-box' };
const btnStyle = { padding: '10px 20px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const thStyle = { padding: '10px 8px', color: '#7f8c8d', fontSize: '12px', textTransform: 'uppercase' };
const tdStyle = { padding: '10px 8px', fontSize: '14px' };

export default AdminMessages;
