// ==============================================================================
// File:      mobile/src/services/auth.js
// Purpose:   Token and session management helpers for React Native.
//            Wraps expo-secure-store to get, set, and remove the JWT
//            token and stored user object.
// Callers:   (currently unused -- available as utility)
// Callees:   expo-secure-store
// Modified:  2026-03-01
// ==============================================================================

// Token and session management for React Native (uses expo-secure-store)
import * as SecureStore from 'expo-secure-store';

export const getToken = () => SecureStore.getItemAsync('token');

export const setToken = (token) => SecureStore.setItemAsync('token', token);

export const removeToken = () => SecureStore.deleteItemAsync('token');

export const getStoredUser = async () => {
  const user = await SecureStore.getItemAsync('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user) => {
  return SecureStore.setItemAsync('user', JSON.stringify(user));
};

export const clearSession = async () => {
  await removeToken();
  await SecureStore.deleteItemAsync('user');
};
