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
