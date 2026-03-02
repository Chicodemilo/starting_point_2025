import React, { useEffect, useState } from 'react';
import { getAdminHealth, getAdminTestResults } from '../../api/admin';

function AdminHealth() {
  const [health, setHealth] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [h, t] = await Promise.all([getAdminHealth(), getAdminTestResults()]);
      setHealth(h);
      setTestResults(t.results);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) return <p>Loading...</p>;

  return (
    <div>
      <h1>System Health</h1>

      {health && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <StatusCard label="API" value={health.api_status} ok={health.api_status === 'running'} />
            <StatusCard label="Database" value={health.database} ok={health.database === 'connected'} />
            <StatCard label="Users" value={health.users} />
            <StatCard label="Groups" value={health.groups} />
            <StatCard label="Items" value={health.items} />
            <StatCard label="Alerts" value={health.alerts} />
            <StatCard label="Messages" value={health.messages} />
          </div>
          <p style={{ color: '#7f8c8d', fontSize: '12px' }}>Last checked: {new Date(health.timestamp).toLocaleString()} (auto-refreshes every 30s)</p>
        </div>
      )}

      <h2>Test Results</h2>
      {!testResults ? (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <p style={{ color: '#7f8c8d', margin: 0 }}>No test results available. Run <code>scripts/run_tests.sh</code> to generate results.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ ...resultCard, borderColor: testResults.passed > 0 ? '#27ae60' : '#dee2e6' }}>
              <strong style={{ color: '#27ae60', fontSize: '24px' }}>{testResults.passed}</strong>
              <span>Passed</span>
            </div>
            <div style={{ ...resultCard, borderColor: testResults.failed > 0 ? '#e74c3c' : '#dee2e6' }}>
              <strong style={{ color: testResults.failed > 0 ? '#e74c3c' : '#27ae60', fontSize: '24px' }}>{testResults.failed}</strong>
              <span>Failed</span>
            </div>
          </div>
          <p style={{ color: '#7f8c8d', fontSize: '13px' }}>Last run: {testResults.timestamp || 'Unknown'}</p>
          {testResults.failed_tests && testResults.failed_tests.length > 0 && (
            <div style={{ padding: '16px', backgroundColor: '#f8d7da', borderRadius: '8px', marginTop: '12px' }}>
              <strong>Failed tests:</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                {testResults.failed_tests.map((t, i) => <li key={i} style={{ color: '#721c24', fontSize: '13px' }}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusCard({ label, value, ok }) {
  return (
    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: `2px solid ${ok ? '#27ae60' : '#e74c3c'}`, textAlign: 'center' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ok ? '#27ae60' : '#e74c3c', margin: '0 auto 8px' }} />
      <p style={{ margin: 0, fontWeight: '600' }}>{value}</p>
      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>{label}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>
      <p style={{ margin: 0, fontWeight: '600', fontSize: '20px' }}>{value}</p>
      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '12px' }}>{label}</p>
    </div>
  );
}

const resultCard = { padding: '16px', backgroundColor: '#fff', borderRadius: '8px', borderWidth: '2px', borderStyle: 'solid', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '100px' };

export default AdminHealth;
