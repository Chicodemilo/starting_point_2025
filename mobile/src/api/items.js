// ==============================================================================
// File:      mobile/src/api/items.js
// Purpose:   Items API functions. Provides CRUD operations for items
//            with pagination and optional group/user filtering.
// Callers:   store/itemStore.js
// Callees:   api/client
// Modified:  2026-03-01
// ==============================================================================

import client from './client';

export const getItems = async ({ page = 1, perPage = 20, groupId, userId } = {}) => {
  const params = { page, per_page: perPage };
  if (groupId) params.group_id = groupId;
  if (userId) params.user_id = userId;
  const { data } = await client.get('/api/items', { params });
  return data;
};

export const getItem = async (itemId) => {
  const { data } = await client.get(`/api/items/${itemId}`);
  return data.item;
};

export const createItem = async ({ title, description, group_id }) => {
  const { data } = await client.post('/api/items', { title, description, group_id });
  return data.item;
};

export const updateItem = async (itemId, updates) => {
  const { data } = await client.put(`/api/items/${itemId}`, updates);
  return data.item;
};

export const deleteItem = async (itemId) => {
  const { data } = await client.delete(`/api/items/${itemId}`);
  return data;
};
