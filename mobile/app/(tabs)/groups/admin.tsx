// ==============================================================================
// File:      mobile/app/(tabs)/groups/admin.tsx
// Purpose:   Group admin screen. Allows the group owner to rename the
//            group, change its icon, regenerate invite codes, invite
//            members by email, and manage member roles or removal.
// Callers:   Expo Router (screen), groups/_layout.tsx,
//            groups/[id].tsx (navigation)
// Callees:   expo-router, expo-image-picker, React Native, Themed,
//            groupStore, authStore, api/groups (updateGroup,
//            uploadGroupIcon, inviteMemberByEmail, updateMemberRole,
//            removeMember, regenerateInvite), config
// Modified:  2026-03-01
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text, View } from '@/components/Themed';
import useGroupStore from '../../../src/store/groupStore';
import useAuthStore from '../../../src/store/authStore';
import { updateGroup, uploadGroupIcon, inviteMemberByEmail, updateMemberRole, removeMember, regenerateInvite } from '../../../src/api/groups';
import { API_URL } from '../../../src/config';

function groupIconUrl(group, size = 'md') {
  if (group?.icon) return `${API_URL}/api/uploads/group_icons/${group.icon}_${size}.jpg`;
  return null;
}

export default function GroupAdminScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentGroup, fetchGroup, loading } = useGroupStore();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => { fetchGroup(id); }, [id]);
  useEffect(() => { if (currentGroup) setName(currentGroup.name); }, [currentGroup]);

  if (loading || !currentGroup) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (currentGroup.owner_id !== user?.id) {
    return <View style={styles.centered}><Text>Only the group owner can manage this group.</Text></View>;
  }

  const handleSaveName = async () => {
    if (!name.trim() || name === currentGroup.name) return;
    setSaving(true);
    try {
      await updateGroup(id, { name: name.trim() });
      await fetchGroup(id);
      Alert.alert('Saved', 'Group name updated');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleIconPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      await uploadGroupIcon(id, result.assets[0].uri);
      await fetchGroup(id);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to upload icon');
    } finally {
      setUploading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const result = await inviteMemberByEmail(id, inviteEmail.trim());
      Alert.alert('Success', result.message);
      setInviteEmail('');
      if (result.status === 'added') await fetchGroup(id);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = (userId, username, currentRole) => {
    const newRole = currentRole === 'member' ? 'admin' : 'member';
    Alert.alert('Change Role', `Make ${username} a ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          try {
            await updateMemberRole(id, userId, newRole);
            await fetchGroup(id);
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to change role');
          }
        }
      },
    ]);
  };

  const handleRemove = (userId, username) => {
    Alert.alert('Remove Member', `Remove ${username} from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await removeMember(id, userId);
            await fetchGroup(id);
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to remove');
          }
        }
      },
    ]);
  };

  const handleRegenInvite = () => {
    Alert.alert('Regenerate Code', 'The old invite code will stop working.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Regenerate', onPress: async () => {
          try {
            await regenerateInvite(id);
            await fetchGroup(id);
          } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed');
          }
        }
      },
    ]);
  };

  const iconSrc = groupIconUrl(currentGroup);

  return (
    <ScrollView style={styles.container}>
      {/* Icon + Name */}
      <View style={styles.card}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleIconPress} style={styles.iconWrap}>
            {iconSrc ? (
              <Image source={{ uri: iconSrc }} style={styles.iconImg} />
            ) : (
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>{currentGroup.name.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.iconOverlay}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.iconOverlayText}>Edit</Text>}
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <TextInput style={styles.nameInput} value={name} onChangeText={setName} />
            <TouchableOpacity
              style={[styles.saveBtn, (!name.trim() || name === currentGroup.name) && styles.disabled]}
              onPress={handleSaveName}
              disabled={saving || !name.trim() || name === currentGroup.name}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Name'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Invite Code */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invite Code</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={styles.inviteCode}>{currentGroup.invite_code}</Text>
          <TouchableOpacity onPress={handleRegenInvite} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Regenerate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Invite by Email */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invite Member</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.nameInput, { flex: 1 }]}
            placeholder="Email address"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.saveBtn, (!inviteEmail.trim() || inviting) && styles.disabled]}
            onPress={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
          >
            <Text style={styles.saveBtnText}>{inviting ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Members */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Members ({currentGroup.members?.length || 0})</Text>
        {currentGroup.members?.map(member => (
          <View key={member.id} style={styles.memberRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{member.username}</Text>
              <Text style={styles.memberMeta}>
                {member.role} · joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
              </Text>
            </View>
            {member.role !== 'owner' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => handleRoleChange(member.user_id, member.username, member.role)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{member.role === 'member' ? '→ Admin' : '→ Member'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(member.user_id, member.username)} style={styles.dangerBtn}>
                  <Text style={styles.dangerBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6', backgroundColor: '#f8f9fa', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { position: 'relative' },
  iconImg: { width: 64, height: 64, borderRadius: 8 },
  iconPlaceholder: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#3498db', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#fff', fontSize: 28, fontWeight: '600' },
  iconOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  iconOverlayText: { color: '#fff', fontSize: 10 },
  nameInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, fontSize: 16, marginBottom: 8 },
  saveBtn: { backgroundColor: '#3498db', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  disabled: { opacity: 0.5 },
  inviteCode: { fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  secondaryBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e9ecef', borderRadius: 6, borderWidth: 1, borderColor: '#dee2e6' },
  secondaryBtnText: { fontSize: 13, color: '#555' },
  dangerBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e74c3c' },
  dangerBtnText: { fontSize: 13, color: '#e74c3c' },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  memberName: { fontSize: 15, fontWeight: '500' },
  memberMeta: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
});
