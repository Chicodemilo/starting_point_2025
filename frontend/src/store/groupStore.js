import { create } from 'zustand';
import { getGroups, getGroup, createGroup, joinGroup, deleteGroup } from '../api/groups';

const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  activeGroup: JSON.parse(localStorage.getItem('activeGroup') || 'null'),
  loading: false,
  error: null,

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
      set((state) => ({
        groups: state.groups.filter(g => g.id !== groupId),
        activeGroup: state.activeGroup?.id === groupId ? null : state.activeGroup,
      }));
      if (get().activeGroup?.id === groupId) {
        localStorage.removeItem('activeGroup');
      }
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete group' });
      throw error;
    }
  },

  setActiveGroup: (group) => {
    localStorage.setItem('activeGroup', JSON.stringify(group));
    set({ activeGroup: group });
  },

  clearActiveGroup: () => {
    localStorage.removeItem('activeGroup');
    set({ activeGroup: null });
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
  clearError: () => set({ error: null }),
}));

export default useGroupStore;
