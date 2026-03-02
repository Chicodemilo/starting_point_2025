import client from './client';

export const adminLogin = async (email, password) => {
  const { data } = await client.post('/api/admin/login', { email, password });
  return data;
};

export const getStats = async () => {
  const { data } = await client.get('/api/admin/stats');
  return data.stats;
};

export const getUsers = async ({ search = '', page = 1, perPage = 20 } = {}) => {
  const { data } = await client.get('/api/admin/users', {
    params: { search, page, per_page: perPage }
  });
  return data;
};

export const getUser = async (userId) => {
  const { data } = await client.get(`/api/admin/users/${userId}`);
  return data;
};

export const updateUser = async (userId, updates) => {
  const { data } = await client.put(`/api/admin/users/${userId}`, updates);
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await client.delete(`/api/admin/users/${userId}`);
  return data;
};

export const getAdminGroups = async ({ search = '', type = '', page = 1, perPage = 20 } = {}) => {
  const { data } = await client.get('/api/admin/groups', {
    params: { search, type, page, per_page: perPage }
  });
  return data;
};

export const getAdminGroup = async (groupId) => {
  const { data } = await client.get(`/api/admin/groups/${groupId}`);
  return data;
};

export const deleteAdminGroup = async (groupId) => {
  const { data } = await client.delete(`/api/admin/groups/${groupId}`);
  return data;
};

export const getAdminHealth = async () => {
  const { data } = await client.get('/api/admin/health');
  return data;
};

export const getAdminTestResults = async () => {
  const { data } = await client.get('/api/admin/test-results');
  return data;
};
