import { create } from 'zustand';
import { getAlerts, getUnreadCount, markAlertRead, deleteAlert } from '../api/alerts';

const useAlertStore = create((set, get) => ({
  alerts: [],
  unreadCount: 0,
  total: 0,
  loading: false,
  error: null,

  fetchAlerts: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await getAlerts(params);
      set({ alerts: data.alerts, total: data.total, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to load alerts', loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadCount();
      set({ unreadCount: count });
    } catch {
      // ignore
    }
  },

  markRead: async (alertId) => {
    try {
      await markAlertRead(alertId);
      set((state) => ({
        alerts: state.alerts.map(a => a.id === alertId ? { ...a, viewed: true } : a),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  removeAlert: async (alertId) => {
    try {
      await deleteAlert(alertId);
      set((state) => ({
        alerts: state.alerts.filter(a => a.id !== alertId),
        total: state.total - 1,
      }));
    } catch {
      // ignore
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAlertStore;
