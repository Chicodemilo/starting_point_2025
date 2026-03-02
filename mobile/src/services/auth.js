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
