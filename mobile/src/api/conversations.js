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
