// ==============================================================================
// File:      mobile/src/api/client.js
// Purpose:   Shared Axios HTTP client. Configures the base URL from
//            config and attaches the JWT token from SecureStore to
//            every outgoing request via an interceptor.
// Callers:   api/auth.js, api/groups.js, api/items.js, api/alerts.js,
//            api/conversations.js
// Callees:   axios, expo-secure-store, config
// Modified:  2026-03-01
// ==============================================================================

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
