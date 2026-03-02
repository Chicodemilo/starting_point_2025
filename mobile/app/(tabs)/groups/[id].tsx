// ==============================================================================
// File:      mobile/app/(tabs)/groups/[id].tsx
// Purpose:   Group detail screen. Shows group icon, name, type,
//            privacy, invite code, and member list. Provides a link
//            to the admin screen for group owners.
// Callers:   Expo Router (screen), groups/_layout.tsx,
//            groups/index.tsx (navigation), (tabs)/index.tsx
// Callees:   expo-router, React Native, Themed, groupStore,
//            authStore, config
// Modified:  2026-03-01
// ==============================================================================

import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useGroupStore from '../../../src/store/groupStore';
import useAuthStore from '../../../src/store/authStore';
import { API_URL } from '../../../src/config';

function groupIconUrl(group, size = 'md') {
  if (group?.icon) return `${API_URL}/api/uploads/group_icons/${group.icon}_${size}.jpg`;
  return null;
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentGroup, fetchGroup, loading } = useGroupStore();

  useEffect(() => { fetchGroup(id); }, [id]);

  if (loading || !currentGroup) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const iconSrc = groupIconUrl(currentGroup);
  const isOwner = currentGroup.owner_id === user?.id;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back to Groups</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        {iconSrc ? (
          <Image source={{ uri: iconSrc }} style={styles.icon} />
        ) : (
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconText}>{currentGroup.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{currentGroup.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.typeBadge}>{currentGroup.type}</Text>
            <Text style={styles.privacyText}>
              {currentGroup.is_private ? 'Private' : 'Public'}
            </Text>
          </View>
        </View>
      </View>

      {isOwner && (
        <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/groups/admin', params: { id } })} style={styles.manageBtn}>
          <Text style={styles.manageBtnText}>Manage Group</Text>
        </TouchableOpacity>
      )}

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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  icon: { width: 48, height: 48, borderRadius: 8 },
  iconPlaceholder: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#3498db', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  name: { fontSize: 24, fontWeight: 'bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
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
  manageBtn: {
    padding: 10, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6',
    borderRadius: 6, alignItems: 'center', marginBottom: 12,
  },
  manageBtnText: { fontSize: 14, color: '#555' },
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
