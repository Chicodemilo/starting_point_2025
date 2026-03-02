// ==============================================================================
// File:      mobile/app/(auth)/check-email.tsx
// Purpose:   Post-registration screen prompting the user to verify
//            their email address. Provides a button to resend the
//            verification email via the auth API.
// Callers:   Expo Router (screen), (auth)/_layout.tsx,
//            (auth)/register.tsx (redirect)
// Callees:   expo-router, React Native, Themed,
//            api/auth (resendVerification)
// Modified:  2026-03-01
// ==============================================================================

import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { resendVerification } from '../../src/api/auth';

export default function CheckEmailScreen() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerification();
      setResent(true);
    } catch {
      // ignore
    }
    setResending(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>&#9993;</Text>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to your email address. Click the link to verify your account.
        </Text>

        {resent ? (
          <Text style={styles.success}>Verification email resent!</Text>
        ) : (
          <TouchableOpacity
            style={[styles.button, resending && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Resend Email</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Link href="/(auth)/login">
            <Text style={styles.link}>Back to Login</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 24, borderRadius: 12, alignItems: 'center' },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#7f8c8d', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  success: { color: '#27ae60', fontWeight: '500', fontSize: 15 },
  button: { backgroundColor: '#3498db', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 6 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 24 },
  link: { color: '#3498db', fontSize: 14 },
});
