import { Stack } from 'expo-router';

export default function GroupsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ title: 'Create Group' }} />
      <Stack.Screen name="join" options={{ title: 'Join Group' }} />
      <Stack.Screen name="[id]" options={{ title: 'Group Details' }} />
      <Stack.Screen name="picker" options={{ title: 'Pick Active Group' }} />
    </Stack>
  );
}
