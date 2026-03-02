import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useGroupStore from '../../src/store/groupStore';

export default function GroupsScreen() {
  const { groups, fetchGroups, loading } = useGroupStore();
  const router = useRouter();

  useEffect(() => { fetchGroups(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/(tabs)/groups/join')}
        >
          <Text style={styles.secondaryBtnText}>Join Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(tabs)/groups/create')}
        >
          <Text style={styles.primaryBtnText}>Create Group</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 40 }} />}

      {!loading && groups.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No groups yet</Text>
          <Text style={styles.emptyText}>Create a new group or join one with an invite code.</Text>
        </View>
      )}

      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupCard}
            onPress={() => router.push({ pathname: '/(tabs)/groups/[id]', params: { id: item.id } })}
          >
            <View style={styles.groupCardLeft}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.groupDesc}>{item.description}</Text>
            </View>
            <View style={styles.groupCardRight}>
              <Text style={styles.typeBadge}>{item.type}</Text>
              <Text style={styles.privacyText}>{item.is_private ? 'Private' : 'Public'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 16 },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 6,
  },
  secondaryBtnText: { color: '#3498db', fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyText: { color: '#7f8c8d', textAlign: 'center' },
  groupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 10,
  },
  groupCardLeft: { flex: 1, marginRight: 12 },
  groupCardRight: { alignItems: 'flex-end' },
  groupName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  groupDesc: { fontSize: 13, color: '#7f8c8d' },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    fontSize: 13,
    color: '#495057',
    overflow: 'hidden',
  },
  privacyText: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
});
