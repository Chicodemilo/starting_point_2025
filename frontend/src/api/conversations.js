import client from './client';

export const getConversations = async () => {
  const { data } = await client.get('/api/conversations');
  return data.conversations;
};

export const createConversation = async (userId) => {
  const { data } = await client.post('/api/conversations', { user_id: userId });
  return data.conversation;
};

export const getMessages = async (conversationId, { page = 1, perPage = 50 } = {}) => {
  const { data } = await client.get(`/api/conversations/${conversationId}/messages`, { params: { page, per_page: perPage } });
  return data;
};

export const sendMessage = async (conversationId, content) => {
  const { data } = await client.post(`/api/conversations/${conversationId}/messages`, { content });
  return data.message;
};

// Admin
export const getAdminConversations = async ({ page = 1, perPage = 20 } = {}) => {
  const { data } = await client.get('/api/admin/conversations', { params: { page, per_page: perPage } });
  return data;
};

export const getAdminMessages = async (conversationId) => {
  const { data } = await client.get(`/api/admin/conversations/${conversationId}/messages`);
  return data;
};

export const deleteAdminMessage = async (messageId) => {
  const { data } = await client.delete(`/api/admin/messages/${messageId}`);
  return data;
};

export const adminBroadcast = async (broadcastData) => {
  const { data } = await client.post('/api/admin/broadcast', broadcastData);
  return data;
};
