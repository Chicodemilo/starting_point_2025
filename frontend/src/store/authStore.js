// ==============================================================================
// File:      frontend/src/store/authStore.js
// Purpose:   Zustand store for authentication state. Manages user login,
//            registration, logout, profile refresh, and JWT token
//            persistence in localStorage.
// Callers:   Home.jsx, Login.jsx, Register.jsx, CheckEmail.jsx,
//            Profile.jsx, Terms.jsx, GroupPicker.jsx, Invite.jsx,
//            Dashboard.jsx, GroupDetail.jsx, GroupAdmin.jsx,
//            MessageThread.jsx
// Callees:   zustand, api/auth.js, api/groups.js, groupStore.js
// Modified:  2026-03-02
// ==============================================================================
import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, getProfile, setActiveGroup as apiSetActiveGroup } from '../api/auth';
import { getGroups } from '../api/groups';
import useGroupStore from './groupStore';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });

      // Sync active group to groupStore
      try {
        const groups = await getGroups();
        if (groups && groups.length > 0) {
          if (data.user.active_group_id) {
            // User already has an active group — find it and sync to groupStore
            const active = groups.find(g => g.id === data.user.active_group_id);
            if (active) useGroupStore.getState().setActiveGroup(active);
          } else {
            // No active group — auto-select the first one
            await apiSetActiveGroup(groups[0].id);
            useGroupStore.getState().setActiveGroup(groups[0]);
            const updatedUser = { ...data.user, active_group_id: groups[0].id };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            set({ user: updatedUser });
          }
        }
      } catch {
        // Non-critical: user can manually select a group later
      }

      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Login failed', loading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRegister(username, email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useGroupStore.getState().clearActiveGroup();
    set({ user: null, token: null });
  },

  refreshProfile: async () => {
    try {
      const data = await getProfile();
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      // Token may be expired
      get().logout();
    }
  },

  isAuthenticated: () => !!get().token,
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
