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

export const updateGroup = async (groupId, updates) => {
  const { data } = await client.put(`/api/groups/${groupId}`, updates);
  return data.group;
};

export const deleteGroup = async (groupId) => {
  const { data } = await client.delete(`/api/groups/${groupId}`);
  return data;
};

export const joinGroup = async (inviteCode) => {
  const { data } = await client.post('/api/groups/join', { invite_code: inviteCode });
  return data.group;
};

export const regenerateInvite = async (groupId) => {
  const { data } = await client.post(`/api/groups/${groupId}/invite`);
  return data.invite_code;
};

export const addMember = async (groupId, userId, role = 'member') => {
  const { data } = await client.post(`/api/groups/${groupId}/members`, { user_id: userId, role });
  return data.member;
};

export const updateMemberRole = async (groupId, userId, role) => {
  const { data } = await client.put(`/api/groups/${groupId}/members/${userId}`, { role });
  return data.member;
};

export const removeMember = async (groupId, userId) => {
  const { data } = await client.delete(`/api/groups/${groupId}/members/${userId}`);
  return data;
};

export const uploadGroupIcon = async (groupId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post(`/api/uploads/group/${groupId}/icon`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.group;
};

export const inviteMemberByEmail = async (groupId, email) => {
  const { data } = await client.post(`/api/groups/${groupId}/invite-email`, { email });
  return data;
};
