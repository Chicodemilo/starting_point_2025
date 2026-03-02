import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, TextInput, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, View } from '@/components/Themed';
import useAuthStore from '../../src/store/authStore';
import { changeEmail, uploadAvatar } from '../../src/api/auth';
import { API_URL } from '../../src/config';

function avatarUrl(user, size = 'md') {
  if (user?.avatar) return `${API_URL}/api/uploads/avatars/${user.avatar}_${size}.jpg`;
  return null;
}

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuthStore();
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === user?.email) return;
    setSubmitting(true);
    setEmailMsg(null);
    try {
      await changeEmail(newEmail);
      setEmailMsg({ type: 'success', text: 'Verification sent to new email.' });
      setNewEmail('');
      await refreshProfile();
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change email' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarPress = async () => {
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
      await uploadAvatar(result.assets[0].uri);
      await refreshProfile();
    } catch (err) {
      Alert.alert('Upload failed', err.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const src = avatarUrl(user);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7} style={styles.avatarWrap}>
        {src ? (
          <Image source={{ uri: src }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={styles.avatarOverlay}>
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.avatarOverlayText}>Edit</Text>
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.username}>{user?.username}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user?.username}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        {user?.pending_email && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pending Email</Text>
              <Text style={[styles.infoValue, { color: '#e67e22' }]}>{user.pending_email}</Text>
            </View>
          </>
        )}
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email Verified</Text>
          <Text style={[styles.infoValue, { color: user?.email_verified ? '#27ae60' : '#e67e22' }]}>
            {user?.email_verified ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Change Email */}
      <View style={styles.emailSection}>
        <Text style={styles.sectionTitle}>Change Email</Text>
        <View style={styles.emailRow}>
          <TextInput
            style={styles.input}
            placeholder="New email address"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.updateBtn, (!newEmail || submitting) && styles.disabled]}
            onPress={handleChangeEmail}
            disabled={!newEmail || submitting}
          >
            <Text style={styles.updateText}>{submitting ? '...' : 'Update'}</Text>
          </TouchableOpacity>
        </View>
        {emailMsg && (
          <Text style={[styles.msgText, { color: emailMsg.type === 'error' ? '#e74c3c' : '#27ae60' }]}>
            {emailMsg.text}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  avatarWrap: { position: 'relative', marginTop: 20, marginBottom: 16 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#3498db',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  avatarOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
    backgroundColor: 'rgba(0,0,0,0.5)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarOverlayText: { color: '#fff', fontSize: 11 },
  username: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, color: '#7f8c8d', marginBottom: 30 },
  infoSection: {
    width: '100%', borderRadius: 12, borderWidth: 1, borderColor: '#dee2e6', padding: 16, marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: 14, color: '#7f8c8d' },
  infoValue: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#dee2e6' },
  emailSection: { width: '100%', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emailRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', fontSize: 14,
  },
  updateBtn: { backgroundColor: '#3498db', paddingHorizontal: 16, borderRadius: 6, justifyContent: 'center' },
  updateText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  disabled: { opacity: 0.5 },
  msgText: { fontSize: 13, marginTop: 6 },
  logoutBtn: {
    width: '100%', padding: 14, backgroundColor: '#e74c3c', borderRadius: 6, alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
