// ==============================================================================
// File:      frontend/src/pages/GroupCreate.jsx
// Purpose:   Group creation form. Lets users name, describe, type, and set
//            privacy for a new group. Submits via groupStore and navigates
//            to the new group's detail page on success.
// Callers:   App.jsx (route: /groups/create)
// Callees:   React, react-router-dom, groupStore.js, api/client.js,
//            PageHeader.jsx, ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import client from '../api/client';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

function GroupCreate() {
  const navigate = useNavigate();
  const { createGroup, loading } = useGroupStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [groupTypes, setGroupTypes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    client.get('/api/config/group-types')
      .then(res => {
        const types = res.data.group_types || res.data;
        setGroupTypes(Array.isArray(types) ? types : []);
        if (Array.isArray(types) && types.length > 0) setType(types[0]);
      })
      .catch(() => {
        setGroupTypes(['club', 'team', 'league', 'group']);
        setType('club');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim(),
        type,
        is_private: isPrivate,
      });
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    }
  };

  return (
    <div>
      <PageHeader title="Create Group" subtitle="Start a new group and invite others to join" />

      <div style={contentArea}>
        <ContentCard>
          <form onSubmit={handleSubmit}>
            <div style={fieldGroup}>
              <label style={labelStyle}>Group Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group about? (optional)"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={fieldGroup}>
              <label style={labelStyle}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                {groupTypes.map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>

            <div style={{ ...fieldGroup, flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <label style={{ ...labelStyle, margin: 0, cursor: 'pointer' }} onClick={() => setIsPrivate(!isPrivate)}>
                Private Group
              </label>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                style={{
                  ...toggleTrack,
                  backgroundColor: isPrivate ? 'var(--brand-primary)' : 'var(--bg-badge-neutral)',
                }}
              >
                <span style={{
                  ...toggleThumb,
                  transform: isPrivate ? 'translateX(20px)' : 'translateX(2px)',
                }} />
              </button>
            </div>

            {error && <p style={errorStyle}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" disabled={loading || !name.trim()} style={{ ...btnPrimary, opacity: loading || !name.trim() ? 0.5 : 1 }}>
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} style={btnSecondary}>
                Cancel
              </button>
            </div>
          </form>
        </ContentCard>
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const fieldGroup = { display: 'flex', flexDirection: 'column', marginBottom: '20px' };
const labelStyle = { fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '6px' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-input-light)', fontSize: '14px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' };
const btnPrimary = { padding: '10px 24px', color: 'var(--text-on-brand)', backgroundColor: 'var(--brand-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const btnSecondary = { padding: '10px 24px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-badge-neutral)', border: '1px solid var(--border-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };
const toggleTrack = { position: 'relative', width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s', padding: 0, flexShrink: 0 };
const toggleThumb = { display: 'block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' };
const errorStyle = { color: 'var(--brand-danger)', fontSize: '14px', margin: '8px 0 0', padding: '8px 12px', backgroundColor: 'var(--bg-danger-subtle, rgba(220,53,69,0.1))', borderRadius: '6px' };

export default GroupCreate;
