// ==============================================================================
// File:      mobile/src/store/authStore.js
// Purpose:   Zustand store for authentication state. Manages user,
//            token, loading, and error. Provides initialize, login,
//            register, refreshProfile, and logout actions backed by
//            SecureStore persistence.
// Callers:   app/_layout.tsx, app/terms.tsx, (auth)/login.tsx,
//            (auth)/register.tsx, (tabs)/index.tsx, (tabs)/profile.tsx,
//            groups/[id].tsx, groups/admin.tsx, groups/picker.tsx,
//            inbox/[id].tsx
// Callees:   zustand, expo-secure-store, api/auth
// Modified:  2026-03-01
// ==============================================================================

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister, getProfile } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await apiLogin(username, password);
      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
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
      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', loading: false });
      throw error;
    }
  },

  refreshProfile: async () => {
    try {
      const data = await getProfile();
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      // Token may be expired
      get().logout();
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
