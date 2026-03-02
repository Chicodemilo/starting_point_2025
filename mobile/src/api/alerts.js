// ==============================================================================
// File:      mobile/src/api/alerts.js
// Purpose:   Alerts API functions. Provides fetching paginated alerts,
//            getting the unread count, marking alerts as read, and
//            deleting alerts.
// Callers:   store/alertStore.js
// Callees:   api/client
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

export const markAlertRead = async (alertId) => {
  const { data } = await client.put(`/api/alerts/${alertId}/read`);
  return data;
};

export const deleteAlert = async (alertId) => {
  const { data } = await client.delete(`/api/alerts/${alertId}`);
  return data;
};
