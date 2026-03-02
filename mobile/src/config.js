// ==============================================================================
// File:      mobile/src/config.js
// Purpose:   Central API configuration. Exports the base API URL,
//            defaulting to localhost for local development. Override
//            via the EXPO_PUBLIC_API_URL environment variable.
// Callers:   api/client.js, (tabs)/profile.tsx, groups/[id].tsx,
//            groups/admin.tsx
// Callees:   (none)
// Modified:  2026-03-01
// ==============================================================================

// API configuration — update this when deploying
// For local dev with a physical device, use your machine's local IP instead of localhost
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5151';
