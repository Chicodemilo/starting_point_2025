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
