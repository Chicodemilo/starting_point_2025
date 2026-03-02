import React, { useEffect } from 'react';
import useAdminStore from '../../store/adminStore';

function AdminDashboard() {
  const { stats, fetchStats, loading } = useAdminStore();

  useEffect(() => { fetchStats(); }, []);

  return (
    <div>
      <h1>Dashboard</h1>

      {loading && <p>Loading stats...</p>}

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', margin: '24px 0' }}>
          <StatCard label="Total Users" value={stats.users} color="#3498db" />
          <StatCard label="Total Groups" value={stats.groups} color="#27ae60" />
          <StatCard label="Total Items" value={stats.items} color="#9b59b6" />
          <StatCard label="Alerts" value={stats.alerts || 0} color="#e67e22" />
          <StatCard label="Messages" value={stats.messages || 0} color="#1abc9c" />
          <StatCard label="Signups (7d)" value={stats.recent_signups} color="#e74c3c" />
        </div>
      )}

      <h2>Quick Links</h2>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <a href="/overview/users" style={linkCard}>Manage Users</a>
        <a href="/overview/groups" style={linkCard}>Manage Groups</a>
        <a href="/overview/alerts" style={linkCard}>Manage Alerts</a>
        <a href="/overview/messages" style={linkCard}>Manage Messages</a>
        <a href="/overview/health" style={linkCard}>System Health</a>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', borderTop: `4px solid ${color}`, textAlign: 'center' }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '2em', color }}>{value}</h2>
      <p style={{ margin: 0, color: '#7f8c8d' }}>{label}</p>
    </div>
  );
}

const linkCard = { display: 'inline-block', padding: '16px 24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', textDecoration: 'none', color: '#2c3e50', fontWeight: '500' };

export default AdminDashboard;
