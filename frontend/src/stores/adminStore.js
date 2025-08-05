import { create } from 'zustand';
import { AdminStorage } from '../utils/localStorage.js';

// Admin modal/view modes
const ADMIN_MODES = {
    DASHBOARD: 'dashboard',
    USERS: 'users',
    CATEGORIES: 'categories',
    EVIDENCE: 'evidence',
    VOTES: 'votes',
    SETTINGS: 'settings',
    USER_EDIT: 'user-edit',
    CATEGORY_EDIT: 'category-edit',
    EVIDENCE_EDIT: 'evidence-edit'
        // Add more admin modes as needed
};

export { ADMIN_MODES };

const useAdminStore = create((set, get) => ({
    // Authentication state
    isAuthenticated: false,
    adminUser: null,
    authToken: null,

    // Modal/View section
    isModalOpen: false,
    modalContent: null,
    currentMode: ADMIN_MODES.DASHBOARD,
    ADMIN_MODES,

    // Data state
    users: [],
    categories: [],
    evidence: [],
    votes: [],
    stats: {
        totalUsers: 0,
        totalCategories: 0,
        totalEvidence: 0,
        totalVotes: 0
    },

    // Loading states
    loading: {
        users: false,
        categories: false,
        evidence: false,
        votes: false,
        stats: false
    },

    // Authentication actions
    login: (user, token) => {
        set({
            isAuthenticated: true,
            adminUser: user,
            authToken: token
        });

        // Save admin data to localStorage using our utility
        AdminStorage.saveAdminLogin(user);
        if (token) {
            AdminStorage.saveAuthToken(token);
        }
    },

    logout: () => {
        set({
            isAuthenticated: false,
            adminUser: null,
            authToken: null,
            currentMode: ADMIN_MODES.DASHBOARD
        });

        // Clear all admin data from localStorage
        AdminStorage.clearAdminData();
    },

    // Modal actions
    openModal: (content, mode = ADMIN_MODES.DASHBOARD) => {
        set({ isModalOpen: true, modalContent: content, currentMode: mode });
    },

    closeModal: () => {
        set({ isModalOpen: false, modalContent: null });
    },

    setMode: (mode) => {
        set({ currentMode: mode });
    },

    // Data actions
    setUsers: (users) => {
        set({ users, stats: {...get().stats, totalUsers: users.length } });
    },

    setCategories: (categories) => {
        set({ categories, stats: {...get().stats, totalCategories: categories.length } });
    },

    setEvidence: (evidence) => {
        set({ evidence, stats: {...get().stats, totalEvidence: evidence.length } });
    },

    setVotes: (votes) => {
        set({ votes, stats: {...get().stats, totalVotes: votes.length } });
    },

    setStats: (stats) => {
        set({ stats });
    },

    // Loading actions
    setLoading: (key, value) => {
        set({ loading: {...get().loading, [key]: value } });
    },

    // Utility actions
    refreshData: async() => {
        // This will be implemented when we have API endpoints
        console.log('Refreshing admin data...');
    },

    // Initialize from localStorage
    initialize: () => {
        const adminData = AdminStorage.getAdminData();
        const authToken = AdminStorage.getAuthToken();

        if (adminData && AdminStorage.isAdminLoggedIn()) {
            set({
                isAuthenticated: true,
                adminUser: adminData,
                authToken: authToken
            });
            console.log('Admin session restored from localStorage:', adminData.username);
        } else {
            // Clear any invalid/incomplete data
            AdminStorage.clearAdminData();
        }
    }
}));

export default useAdminStore;