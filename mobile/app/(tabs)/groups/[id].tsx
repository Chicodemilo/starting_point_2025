import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useGroupStore from '../../../src/store/groupStore';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentGroup, fetchGroup, loading } = useGroupStore();

  useEffect(() => { fetchGroup(id); }, [id]);

  if (loading || !currentGroup) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back to Groups</Text>
      </TouchableOpacity>

      <Text style={styles.name}>{currentGroup.name}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.typeBadge}>{currentGroup.type}</Text>
        <Text style={styles.privacyText}>
          {currentGroup.is_private ? 'Private' : 'Public'}
        </Text>
      </View>
      {currentGroup.description ? (
        <Text style={styles.description}>{currentGroup.description}</Text>
      ) : null}

      {currentGroup.invite_code ? (
        <View style={styles.inviteBox}>
          <Text style={styles.inviteLabel}>Invite Code</Text>
          <Text style={styles.inviteCode}>{currentGroup.invite_code}</Text>
        </View>
      ) : null}

      <Text style={styles.membersTitle}>
        Members ({currentGroup.members?.length || 0})
      </Text>

      <FlatList
        data={currentGroup.members || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <Text style={styles.memberName}>{item.username}</Text>
            <Text style={styles.roleBadge}>{item.role}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No members found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { marginBottom: 16 },
  backText: { color: '#3498db', fontSize: 15 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    fontSize: 13,
    color: '#495057',
    overflow: 'hidden',
  },
  privacyText: { color: '#7f8c8d', fontSize: 13 },
  description: { fontSize: 15, color: '#555', marginBottom: 16 },
  inviteBox: {
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 24,
  },
  inviteLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  inviteCode: { fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  membersTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberName: { fontSize: 15 },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    fontSize: 12,
    color: '#4a5568',
    overflow: 'hidden',
  },
  emptyText: { color: '#7f8c8d', textAlign: 'center', paddingVertical: 20 },
});
