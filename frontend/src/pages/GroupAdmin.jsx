// ==============================================================================
// File:      frontend/src/pages/GroupAdmin.jsx
// Purpose:   Group administration page for owners. Allows renaming the
//            group, uploading an icon, regenerating invite codes, inviting
//            members by email, changing member roles, and removing members.
// Callers:   App.jsx (route: /groups/:id/admin)
// Callees:   React, react-router-dom, groupStore.js, authStore.js,
//            api/groups.js, PageHeader.jsx, ContentCard.jsx
// Modified:  2026-03-03
// ==============================================================================
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import { updateGroup, uploadGroupIcon, inviteMemberByEmail, updateMemberRole, removeMember, regenerateInvite } from '../api/groups';
import PageHeader from '../components/PageHeader';
import ContentCard from '../components/ContentCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5151';

function groupIconUrl(group, size = 'md') {
  if (group?.icon) return `${API_URL}/api/uploads/group_icons/${group.icon}_${size}.jpg`;
  return null;
}

function GroupAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentGroup, fetchGroup, loading } = useGroupStore();
  const fileRef = useRef(null);

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  useEffect(() => { fetchGroup(id); }, [id]);
  useEffect(() => { if (currentGroup) setName(currentGroup.name); }, [currentGroup]);

  if (loading || !currentGroup) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (currentGroup.owner_id !== user?.id) {
    return <div style={{ padding: '20px' }}>Only the group owner can manage this group.</div>;
  }

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim() || name === currentGroup.name) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateGroup(id, { name: name.trim() });
      await fetchGroup(id);
      setSaveMsg({ ok: true, text: 'Name updated' });
    } catch (err) {
      setSaveMsg({ ok: false, text: err.response?.data?.error || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  const handleIconChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadGroupIcon(id, file);
      await fetchGroup(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload icon');
    } finally {
      setUploading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const result = await inviteMemberByEmail(id, inviteEmail.trim());
      setInviteMsg({ ok: true, text: result.message });
      setInviteEmail('');
      if (result.status === 'added') await fetchGroup(id);
    } catch (err) {
      setInviteMsg({ ok: false, text: err.response?.data?.error || 'Failed to invite' });
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateMemberRole(id, userId, newRole);
      await fetchGroup(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change role');
    }
  };

  const handleRemoveMember = async (userId, username) => {
    if (!window.confirm(`Remove ${username} from this group?`)) return;
    try {
      await removeMember(id, userId);
      await fetchGroup(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleRegenInvite = async () => {
    if (!window.confirm('Generate a new invite code? The old one will stop working.')) return;
    try {
      await regenerateInvite(id);
      await fetchGroup(id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to regenerate');
    }
  };

  const iconSrc = groupIconUrl(currentGroup);

  return (
    <div>
      <PageHeader title="Manage Group" subtitle={currentGroup.name} />

      <div style={contentArea}>
        {/* Group Icon + Name */}
        <ContentCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
              {iconSrc ? (
                <img src={iconSrc} alt="icon" style={iconImgStyle} />
              ) : (
                <div style={iconPlaceholder}>{currentGroup.name.charAt(0).toUpperCase()}</div>
              )}
              <div style={iconOverlay}>{uploading ? '...' : 'Edit'}</div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleIconChange} style={{ display: 'none' }} />
            </div>
            <form onSubmit={handleSaveName} style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input-light)', fontSize: '16px' }} />
              <button type="submit" disabled={saving || !name.trim() || name === currentGroup.name}
                style={{ ...btnPrimary, opacity: saving || !name.trim() || name === currentGroup.name ? 0.5 : 1 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
          {saveMsg && <p style={{ color: saveMsg.ok ? 'var(--brand-success)' : 'var(--brand-danger)', fontSize: '14px', margin: '8px 0 0' }}>{saveMsg.text}</p>}
        </ContentCard>

        {/* Invite Code */}
        <ContentCard>
          <h3 style={{ margin: '0 0 8px' }}>Invite Code</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <code style={{ fontSize: '18px', backgroundColor: 'var(--bg-highlight)', padding: '6px 12px', borderRadius: '4px' }}>
              {currentGroup.invite_code}
            </code>
            <button onClick={handleRegenInvite} style={btnSecondary}>Regenerate</button>
          </div>
        </ContentCard>

        {/* Invite by Email */}
        <ContentCard>
          <h3 style={{ margin: '0 0 12px' }}>Invite Member</h3>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: '8px' }}>
            <input type="email" placeholder="Email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-input-light)', fontSize: '14px' }} />
            <button type="submit" disabled={inviting || !inviteEmail.trim()}
              style={{ ...btnPrimary, opacity: inviting || !inviteEmail.trim() ? 0.5 : 1 }}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
          {inviteMsg && <p style={{ color: inviteMsg.ok ? 'var(--brand-success)' : 'var(--brand-danger)', fontSize: '14px', marginTop: '8px' }}>{inviteMsg.text}</p>}
        </ContentCard>

        {/* Members */}
        <ContentCard style={{ padding: 0, overflow: 'hidden' }}>
          <h3 style={{ margin: 0, padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>Members ({currentGroup.members?.length || 0})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>User</th>
                <th style={th}>Role</th>
                <th style={th}>Member Since</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentGroup.members?.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={td}>{member.username}</td>
                  <td style={td}>
                    {member.role === 'owner' ? (
                      <span style={ownerBadge}>owner</span>
                    ) : (
                      <select value={member.role} onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-input-light)', fontSize: '13px' }}>
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td style={td}>
                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={td}>
                    {member.role !== 'owner' && (
                      <button onClick={() => handleRemoveMember(member.user_id, member.username)} style={removeBtn}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentCard>
      </div>
    </div>
  );
}

const contentArea = { padding: '0 24px 24px' };
const btnPrimary = { padding: '10px 20px', color: 'var(--text-on-brand)', backgroundColor: 'var(--brand-primary)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };
const btnSecondary = { padding: '8px 14px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-badge-neutral)', border: '1px solid var(--border-primary)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' };
const removeBtn = { padding: '4px 10px', color: 'var(--brand-danger)', backgroundColor: 'transparent', border: '1px solid var(--brand-danger)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' };
const ownerBadge = { display: 'inline-block', padding: '2px 8px', backgroundColor: 'var(--bg-badge-owner)', color: 'var(--text-badge-owner)', borderRadius: '4px', fontSize: '12px', fontWeight: '500' };
const iconImgStyle = { width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' };
const iconPlaceholder = { width: '64px', height: '64px', borderRadius: '8px', backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '600' };
const iconOverlay = { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--bg-overlay)', color: 'var(--text-on-brand)', fontSize: '10px', textAlign: 'center', borderRadius: '0 0 8px 8px', padding: '2px 0' };
const th = { padding: '8px 20px', textAlign: 'left', borderBottom: '2px solid var(--border-primary)', fontSize: '13px', color: 'var(--text-table-header)' };
const td = { padding: '10px 20px', fontSize: '14px' };

export default GroupAdmin;
