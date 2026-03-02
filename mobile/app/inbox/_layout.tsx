// ==============================================================================
// File:      mobile/app/inbox/_layout.tsx
// Purpose:   Stack layout for the inbox modal. Declares screens for
//            the unified inbox, alerts, conversations, and individual
//            conversation views.
// Callers:   app/_layout.tsx (Stack.Screen name="inbox")
// Callees:   expo-router
// Modified:  2026-03-01
// ==============================================================================

import { Stack } from 'expo-router';

export default function InboxLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Inbox' }} />
      <Stack.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Stack.Screen name="conversations" options={{ title: 'Conversations' }} />
      <Stack.Screen name="[id]" options={{ title: 'Conversation' }} />
    </Stack>
  );
}
