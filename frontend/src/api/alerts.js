// ==============================================================================
// File:      frontend/src/api/alerts.js
// Purpose:   Alert API functions. Provides CRUD for user alerts, unread
//            count retrieval, and admin alert management endpoints for
//            creating and listing system-wide alerts.
// Callers:   alertStore.js, AdminAlerts.jsx
// Callees:   api/client.js
// Modified:  2026-03-01
// ==============================================================================
import client from './client';

export const getAlerts = async ({ page = 1, perPage = 20 } = {}) => {
  const { data } = await client.get('/api/alerts', { params: { page, per_page: perPage } });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await client.get('/api/alerts/unread-count');
  return data.unread_count;
};

export const createAlert = async (alertData) => {
  const { data } = await client.post('/api/alerts', alertData);
  return data;
};

export const markAlertRead = async (alertId) => {
  const { data } = await client.put(`/api/alerts/${alertId}/read`);
  return data;
};

export const deleteAlert = async (alertId) => {
  const { data } = await client.delete(`/api/alerts/${alertId}`);
  return data;
};

// Admin
export const getAdminAlerts = async ({ page = 1, perPage = 20 } = {}) => {
  const { data } = await client.get('/api/admin/alerts', { params: { page, per_page: perPage } });
  return data;
};

export const createAdminAlert = async (alertData) => {
  const { data } = await client.post('/api/admin/alerts', alertData);
  return data;
};
