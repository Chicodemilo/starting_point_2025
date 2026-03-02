import { create } from 'zustand';
import { getItems, createItem, updateItem, deleteItem } from '../api/items';

const useItemStore = create((set) => ({
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,

  fetchItems: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await getItems(params);
      set({
        items: data.items,
        total: data.total,
        page: data.page,
        pages: data.pages,
        loading: false
      });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to load items', loading: false });
    }
  },

  createItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const item = await createItem(data);
      set((state) => ({ items: [item, ...state.items], loading: false }));
      return item;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create item', loading: false });
      throw error;
    }
  },

  updateItem: async (itemId, data) => {
    try {
      const item = await updateItem(itemId, data);
      set((state) => ({
        items: state.items.map(i => i.id === itemId ? item : i)
      }));
      return item;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update item' });
      throw error;
    }
  },

  deleteItem: async (itemId) => {
    try {
      await deleteItem(itemId);
      set((state) => ({ items: state.items.filter(i => i.id !== itemId) }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete item' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useItemStore;
