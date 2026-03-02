import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';

function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, fetchGroup, deleteGroup, loading } = useGroupStore();

  useEffect(() => { fetchGroup(id); }, [id]);

  if (loading || !currentGroup) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/groups')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3498db', marginBottom: '16px' }}>
        &larr; Back to Groups
      </button>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0' }}>{currentGroup.name}</h1>
        <span style={typeBadge}>{currentGroup.type}</span>
        <span style={{ marginLeft: '8px', color: '#7f8c8d' }}>{currentGroup.is_private ? 'Private' : 'Public'}</span>
        <p style={{ marginTop: '12px', color: '#555' }}>{currentGroup.description}</p>
      </div>

      {currentGroup.invite_code && (
        <div style={{ padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px', marginBottom: '24px' }}>
          <strong>Invite Code:</strong> <code style={{ fontSize: '18px', marginLeft: '8px' }}>{currentGroup.invite_code}</code>
        </div>
      )}

      <h2>Members ({currentGroup.members?.length || 0})</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {currentGroup.members?.map(member => (
          <li key={member.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span>{member.username}</span>
            <span style={roleBadge}>{member.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const typeBadge = { display: 'inline-block', padding: '2px 10px', backgroundColor: '#e9ecef', borderRadius: '12px', fontSize: '13px' };
const roleBadge = { padding: '2px 8px', backgroundColor: '#e2e8f0', borderRadius: '4px', fontSize: '12px', color: '#4a5568' };

export default GroupDetail;
