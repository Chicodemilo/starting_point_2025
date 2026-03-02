import client from './client';

export const getGroups = async (publicOnly = false) => {
  const { data } = await client.get('/api/groups', { params: { public: publicOnly } });
  return data.groups;
};

export const getGroup = async (groupId) => {
  const { data } = await client.get(`/api/groups/${groupId}`);
  return data.group;
};

export const createGroup = async ({ name, description, type, is_private }) => {
  const { data } = await client.post('/api/groups', { name, description, type, is_private });
  return data.group;
};

export const joinGroup = async (inviteCode) => {
  const { data } = await client.post('/api/groups/join', { invite_code: inviteCode });
  return data.group;
};

export const deleteGroup = async (groupId) => {
  const { data } = await client.delete(`/api/groups/${groupId}`);
  return data;
};

export const regenerateInvite = async (groupId) => {
  const { data } = await client.post(`/api/groups/${groupId}/invite`);
  return data.invite_code;
};

export const getGroupTypes = async () => {
  const { data } = await client.get('/api/config/group-types');
  return data.types;
};

export const updateGroup = async (groupId, updates) => {
  const { data } = await client.put(`/api/groups/${groupId}`, updates);
  return data.group;
};

export const uploadGroupIcon = async (groupId, uri) => {
  const formData = new FormData();
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  formData.append('file', {
    uri,
    name: `icon.${ext}`,
    type: ext === 'png' ? 'image/png' : 'image/jpeg',
  });
  const { data } = await client.post(`/api/uploads/group/${groupId}/icon`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.group;
};

export const inviteMemberByEmail = async (groupId, email) => {
  const { data } = await client.post(`/api/groups/${groupId}/invite-email`, { email });
  return data;
};

export const updateMemberRole = async (groupId, userId, role) => {
  const { data } = await client.put(`/api/groups/${groupId}/members/${userId}`, { role });
  return data.member;
};

export const removeMember = async (groupId, userId) => {
  const { data } = await client.delete(`/api/groups/${groupId}/members/${userId}`);
  return data;
};
