// ==============================================================================
// File:      mobile/app/(tabs)/groups/picker.tsx
// Purpose:   Active group picker screen. Lists all groups the user
//            belongs to and lets them select one as the active group
//            for alerts and messaging.
// Callers:   Expo Router (screen), groups/_layout.tsx,
//            (tabs)/index.tsx (navigation)
// Callees:   expo-router, React Native, Themed, authStore,
//            groupStore, api/auth (setActiveGroup)
// Modified:  2026-03-01
// ==============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useAuthStore from '../../../src/store/authStore';
import useGroupStore from '../../../src/store/groupStore';
import { setActiveGroup } from '../../../src/api/auth';

export default function GroupPickerScreen() {
  const { user } = useAuthStore();
  const { groups, fetchGroups, loading } = useGroupStore();
  const router = useRouter();

  useEffect(() => { fetchGroups(); }, []);

  const handleSetActive = async (groupId: number) => {
    try {
      await setActiveGroup(groupId);
      // Refresh user profile to get updated active_group_id
      const { refreshProfile } = useAuthStore.getState();
      if (refreshProfile) await refreshProfile();
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to set active group');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Choose a group for alerts and messaging</Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const isActive = user?.active_group_id === item.id;
          return (
            <TouchableOpacity
              style={[styles.groupRow, isActive && styles.activeRow]}
              onPress={() => handleSetActive(item.id)}
            >
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupMeta}>{item.type}</Text>
              </View>
              {isActive && <Text style={styles.activeBadge}>Active</Text>}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No groups yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  subtitle: { color: '#7f8c8d', marginBottom: 16, fontSize: 15 },
  groupRow: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeRow: { borderColor: '#3498db', borderWidth: 2 },
  groupInfo: {},
  groupName: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  groupMeta: { fontSize: 13, color: '#7f8c8d' },
  activeBadge: { backgroundColor: '#3498db', color: 'white', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, fontSize: 12, overflow: 'hidden' },
  empty: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 20 },
});
