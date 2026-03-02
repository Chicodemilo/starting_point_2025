// ==============================================================================
// File:      mobile/app/(tabs)/index.tsx
// Purpose:   Home tab screen. Displays a welcome greeting, active
//            group status, summary stats for groups and items, and a
//            preview list of the user's groups.
// Callers:   Expo Router (screen), (tabs)/_layout.tsx
// Callees:   expo-router, React Native, Themed, authStore,
//            groupStore, itemStore
// Modified:  2026-03-01
// ==============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useAuthStore from '../../src/store/authStore';
import useGroupStore from '../../src/store/groupStore';
import useItemStore from '../../src/store/itemStore';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { groups, fetchGroups } = useGroupStore();
  const { items, fetchItems } = useItemStore();
  const router = useRouter();

  useEffect(() => {
    fetchGroups();
    fetchItems();
  }, []);

  const activeGroup = groups.find(g => g.id === user?.active_group_id);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Welcome, {user?.username || 'User'}</Text>

      {!user?.active_group_id ? (
        <TouchableOpacity
          style={styles.promptCard}
          onPress={() => router.push('/(tabs)/groups/picker')}
        >
          <Text style={styles.promptText}>No active group selected.</Text>
          <Text style={styles.promptLink}>Pick a group to enable alerts & messaging</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>Active: <Text style={{ fontWeight: '600' }}>{activeGroup?.name || `Group #${user.active_group_id}`}</Text></Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/groups/picker')}>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{groups.length}</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{items.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Groups</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/groups')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {groups.length === 0 ? (
          <Text style={styles.emptyText}>No groups yet. Create or join one!</Text>
        ) : (
          <FlatList
            data={groups.slice(0, 3)}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.groupRow}
                onPress={() => router.push({ pathname: '/(tabs)/groups/[id]', params: { id: item.id } })}
              >
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <Text style={styles.groupMeta}>{item.type} · {item.is_private ? 'Private' : 'Public'}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  promptCard: {
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
    marginBottom: 16,
  },
  promptText: { fontWeight: '600', color: '#856404', marginBottom: 4 },
  promptLink: { color: '#856404', fontSize: 13 },
  activeCard: {
    padding: 12,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#28a745',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeLabel: { color: '#155724', fontSize: 14 },
  changeLink: { color: '#155724', fontSize: 13, textDecorationLine: 'underline' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#3498db' },
  statLabel: { fontSize: 13, color: '#7f8c8d', marginTop: 4 },
  section: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  seeAll: { color: '#3498db', fontSize: 14 },
  emptyText: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 20 },
  groupRow: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 8,
  },
  groupInfo: {},
  groupName: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  groupMeta: { fontSize: 13, color: '#7f8c8d' },
});
