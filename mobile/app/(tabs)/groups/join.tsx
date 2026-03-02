// ==============================================================================
// File:      mobile/app/(tabs)/groups/join.tsx
// Purpose:   Join group screen. Accepts an invite code and joins the
//            group via groupStore, then navigates back on success.
// Callers:   Expo Router (screen), groups/_layout.tsx,
//            groups/index.tsx (navigation)
// Callees:   expo-router, React Native, Themed, groupStore
// Modified:  2026-03-01
// ==============================================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useGroupStore from '../../../src/store/groupStore';

export default function JoinGroupScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const { joinGroup, loading, error, clearError } = useGroupStore();
  const router = useRouter();

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    try {
      await joinGroup(inviteCode.trim());
      router.back();
    } catch {
      // Error is set in store
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Group</Text>
      <Text style={styles.subtitle}>
        Enter the invite code shared with you to join an existing group.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Invite Code</Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={(v) => { setInviteCode(v); clearError(); }}
          placeholder="Enter invite code"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleJoin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Join Group</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#7f8c8d', marginBottom: 30 },
  field: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '500', marginBottom: 8 },
  input: {
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    fontSize: 14,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
