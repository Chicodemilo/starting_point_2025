// ==============================================================================
// File:      mobile/app/(tabs)/_layout.tsx
// Purpose:   Tab navigator layout. Defines Home, Groups, and Profile
//            tabs with icons. Renders a bell icon with unread badge
//            that opens the inbox modal.
// Callers:   app/_layout.tsx (Stack.Screen name="(tabs)")
// Callees:   expo-router, expo-symbols, React Native, Themed, Colors,
//            useColorScheme, alertStore, messagingStore
// Modified:  2026-03-01
// ==============================================================================

import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Text, View } from '@/components/Themed';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import useAlertStore from '../../src/store/alertStore';
import useMessagingStore from '../../src/store/messagingStore';

function BellIcon() {
  const { unreadCount, fetchUnreadCount } = useAlertStore();
  const { conversations, fetchConversations } = useMessagingStore();
  const router = useRouter();

  useEffect(() => {
    fetchUnreadCount();
    fetchConversations();
  }, []);

  const messageUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);
  const total = unreadCount + messageUnread;

  return (
    <TouchableOpacity
      onPress={() => router.push('/inbox')}
      style={{ marginRight: 16, position: 'relative' }}
    >
      <Text style={{ fontSize: 22 }}>&#128276;</Text>
      {total > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: '#e74c3c', borderRadius: 10,
          minWidth: 18, height: 18,
          alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{total}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerRight: () => <BellIcon />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'person.3.fill', android: 'groups', web: 'groups' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
