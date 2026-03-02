// ==============================================================================
// File:      mobile/app/(auth)/_layout.tsx
// Purpose:   Stack layout for the auth group. Renders login, register,
//            and check-email screens with hidden headers.
// Callers:   app/_layout.tsx (Stack.Screen name="(auth)")
// Callees:   expo-router
// Modified:  2026-03-01
// ==============================================================================

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="check-email" />
    </Stack>
  );
}
