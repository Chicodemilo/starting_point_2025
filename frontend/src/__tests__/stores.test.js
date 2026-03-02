import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

// Test Zustand stores in isolation (no API calls)
describe('authStore', () => {
  let useAuthStore;

  beforeEach(async () => {
    const mod = await import('../store/authStore');
    useAuthStore = mod.default;
    act(() => {
      useAuthStore.setState({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    });
  });

  it('starts with no user', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('clearError clears the error', () => {
    act(() => {
      useAuthStore.setState({ error: 'Some error' });
    });
    expect(useAuthStore.getState().error).toBe('Some error');

    act(() => {
      useAuthStore.getState().clearError();
    });
    expect(useAuthStore.getState().error).toBeNull();
  });
});

describe('groupStore', () => {
  let useGroupStore;

  beforeEach(async () => {
    const mod = await import('../store/groupStore');
    useGroupStore = mod.default;
    act(() => {
      useGroupStore.setState({
        groups: [],
        currentGroup: null,
        activeGroup: null,
        loading: false,
        error: null,
      });
    });
  });

  it('starts with empty groups', () => {
    const state = useGroupStore.getState();
    expect(state.groups).toEqual([]);
  });

  it('setCurrentGroup sets the group', () => {
    const group = { id: 1, name: 'Test' };
    act(() => {
      useGroupStore.getState().setCurrentGroup(group);
    });
    expect(useGroupStore.getState().currentGroup).toEqual(group);
  });

  it('setActiveGroup persists to state', () => {
    const group = { id: 2, name: 'Active Group' };
    act(() => {
      useGroupStore.getState().setActiveGroup(group);
    });
    expect(useGroupStore.getState().activeGroup).toEqual(group);
  });

  it('clearActiveGroup clears the active group', () => {
    act(() => {
      useGroupStore.setState({ activeGroup: { id: 1, name: 'Test' } });
    });
    act(() => {
      useGroupStore.getState().clearActiveGroup();
    });
    expect(useGroupStore.getState().activeGroup).toBeNull();
  });
});

describe('itemStore', () => {
  let useItemStore;

  beforeEach(async () => {
    const mod = await import('../store/itemStore');
    useItemStore = mod.default;
    act(() => {
      useItemStore.setState({
        items: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null,
      });
    });
  });

  it('starts with empty items', () => {
    const state = useItemStore.getState();
    expect(state.items).toEqual([]);
    expect(state.total).toBe(0);
  });

  it('clearError clears the error', () => {
    act(() => {
      useItemStore.setState({ error: 'Oops' });
    });
    act(() => {
      useItemStore.getState().clearError();
    });
    expect(useItemStore.getState().error).toBeNull();
  });
});

describe('alertStore', () => {
  let useAlertStore;

  beforeEach(async () => {
    const mod = await import('../store/alertStore');
    useAlertStore = mod.default;
    act(() => {
      useAlertStore.setState({
        alerts: [],
        unreadCount: 0,
        total: 0,
        loading: false,
        error: null,
      });
    });
  });

  it('starts with empty alerts', () => {
    const state = useAlertStore.getState();
    expect(state.alerts).toEqual([]);
    expect(state.unreadCount).toBe(0);
  });

  it('clearError clears the error', () => {
    act(() => {
      useAlertStore.setState({ error: 'Alert error' });
    });
    act(() => {
      useAlertStore.getState().clearError();
    });
    expect(useAlertStore.getState().error).toBeNull();
  });
});

describe('messagingStore', () => {
  let useMessagingStore;

  beforeEach(async () => {
    const mod = await import('../store/messagingStore');
    useMessagingStore = mod.default;
    act(() => {
      useMessagingStore.setState({
        conversations: [],
        currentMessages: [],
        currentConversation: null,
        total: 0,
        loading: false,
        error: null,
      });
    });
  });

  it('starts with empty conversations', () => {
    const state = useMessagingStore.getState();
    expect(state.conversations).toEqual([]);
    expect(state.currentMessages).toEqual([]);
  });

  it('clearError clears the error', () => {
    act(() => {
      useMessagingStore.setState({ error: 'Message error' });
    });
    act(() => {
      useMessagingStore.getState().clearError();
    });
    expect(useMessagingStore.getState().error).toBeNull();
  });
});
