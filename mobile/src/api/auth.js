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

export const resendVerification = async () => {
  const { data } = await client.post('/api/auth/resend-verification');
  return data;
};

export const setActiveGroup = async (groupId) => {
  const { data } = await client.put('/api/auth/active-group', { group_id: groupId });
  return data;
};

export const acceptTerms = async () => {
  const { data } = await client.put('/api/auth/accept-terms');
  return data;
};

export const getTerms = async () => {
  const { data } = await client.get('/api/auth/terms');
  return data;
};

export const changeEmail = async (email) => {
  const { data } = await client.put('/api/auth/change-email', { email });
  return data;
};

export const uploadAvatar = async (uri) => {
  const formData = new FormData();
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  formData.append('file', {
    uri,
    name: `avatar.${ext}`,
    type: ext === 'png' ? 'image/png' : 'image/jpeg',
  });
  const { data } = await client.post('/api/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
