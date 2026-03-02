// ==============================================================================
// File:      mobile/src/store/groupStore.js
// Purpose:   Zustand store for group state. Manages groups list,
//            current group detail, active group, and CRUD actions
//            (fetch, create, join, delete) with SecureStore
//            persistence for the active group selection.
// Callers:   (tabs)/index.tsx, groups/index.tsx, groups/[id].tsx,
//            groups/admin.tsx, groups/create.tsx, groups/join.tsx,
//            groups/picker.tsx
// Callees:   zustand, expo-secure-store, api/groups
// Modified:  2026-03-01
// ==============================================================================

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getGroups, getGroup, createGroup, joinGroup, deleteGroup } from '../api/groups';

const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  activeGroup: null,
  loading: false,
  error: null,

  initActiveGroup: async () => {
    try {
      const stored = await SecureStore.getItemAsync('activeGroup');
      if (stored) {
        set({ activeGroup: JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
  },

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const groups = await getGroups();
      set({ groups, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to load groups', loading: false });
    }
  },

  fetchGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const group = await getGroup(groupId);
      set({ currentGroup: group, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to load group', loading: false });
    }
  },

  createGroup: async (data) => {
    set({ loading: true, error: null });
    try {
      const group = await createGroup(data);
      set((state) => ({ groups: [...state.groups, group], loading: false }));
      return group;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create group', loading: false });
      throw error;
    }
  },

  joinGroup: async (inviteCode) => {
    set({ loading: true, error: null });
    try {
      const group = await joinGroup(inviteCode);
      set((state) => ({ groups: [...state.groups, group], loading: false }));
      return group;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to join group', loading: false });
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await deleteGroup(groupId);
      const isActive = get().activeGroup?.id === groupId;
      set((state) => ({ groups: state.groups.filter(g => g.id !== groupId) }));
      if (isActive) {
        await SecureStore.deleteItemAsync('activeGroup');
        set({ activeGroup: null });
      }
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete group' });
      throw error;
    }
  },

  setActiveGroup: async (group) => {
    await SecureStore.setItemAsync('activeGroup', JSON.stringify(group));
    set({ activeGroup: group });
  },

  clearActiveGroup: async () => {
    await SecureStore.deleteItemAsync('activeGroup');
    set({ activeGroup: null });
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
  clearError: () => set({ error: null }),
}));

export default useGroupStore;
