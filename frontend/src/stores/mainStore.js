import { create } from 'zustand';

// Modal state and actions
const MODES = {
    MAIN: 'main',
    FAQ: 'faq',
    LOGIN_REGISTER: 'login-register',
    NEW_EVIDENCE: 'new-evidence',
    NEW_CATEGORY: 'new-category'
    // Add more modes as needed
};

export { MODES };

const useMainStore = create((set) => ({
    // Modal section
    isOpen: false,
    content: null,
    mode: MODES.MAIN,
    MODES,
    openModal: (content, mode = MODES.MAIN) => {
        set({ isOpen: true, content, mode });
    },
    closeModal: () => {
        set({ isOpen: false, content: null, mode: MODES.MAIN });
    },
    setMode: (mode) => {
        set({ mode });
    },
    // Add additional state/features here as needed
}));

export default useMainStore;