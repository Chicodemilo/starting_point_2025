import client from './client';

export const login = async (username, password) => {
  const { data } = await client.post('/api/auth/login', { username, password });
  return data;
};

export const register = async (username, email, password) => {
  const { data } = await client.post('/api/auth/register', { username, email, password });
  return data;
};

export const verifyToken = async () => {
  const { data } = await client.get('/api/auth/verify');
  return data;
};

export const getProfile = async () => {
  const { data } = await client.get('/api/auth/profile');
  return data;
};

export const verifyEmail = async (token) => {
  const { data } = await client.get(`/api/auth/verify-email?token=${token}`);
  return data;
};

export const resendVerification = async () => {
  const { data } = await client.post('/api/auth/resend-verification');
  return data;
};

export const setActiveGroup = async (groupId) => {
  const { data } = await client.put('/api/auth/active-group', { group_id: groupId });
  return data;
};
