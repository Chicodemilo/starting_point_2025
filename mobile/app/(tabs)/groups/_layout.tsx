// ==============================================================================
// File:      mobile/app/(tabs)/groups/_layout.tsx
// Purpose:   Stack layout for the groups tab. Declares screens for
//            the group list, create, join, detail, picker, and admin.
// Callers:   (tabs)/_layout.tsx (Tabs.Screen name="groups")
// Callees:   expo-router
// Modified:  2026-03-01
// ==============================================================================

import { Stack } from 'expo-router';

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ title: 'Create Group' }} />
      <Stack.Screen name="join" options={{ title: 'Join Group' }} />
      <Stack.Screen name="[id]" options={{ title: 'Group Details' }} />
      <Stack.Screen name="picker" options={{ title: 'Pick Active Group' }} />
      <Stack.Screen name="admin" options={{ title: 'Manage Group' }} />
    </Stack>
  );
}
