// ==============================================================================
// File:      mobile/app/(auth)/register.tsx
// Purpose:   Registration screen. Collects username, email, and
//            password with client-side validation, then creates the
//            account via authStore and redirects to check-email.
// Callers:   Expo Router (screen), (auth)/_layout.tsx
// Callees:   expo-router, React Native, Themed, authStore,
//            services/validation
// Modified:  2026-03-01
// ==============================================================================

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Text, View } from '@/components/Themed';
import useAuthStore from '../../src/store/authStore';
import { validateRegistration } from '../../src/services/validation';

export default function RegisterScreen() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const { register, loading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    clearError();
    setFieldErrors({});
  };

  const handleRegister = async () => {
    const validationErrors = validateRegistration(form);
    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }
    try {
      await register(form.username, form.email, form.password);
      router.replace('/(auth)/check-email');
    } catch {
      // Error is set in store
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={form.username}
              onChangeText={(v) => handleChange('username', v)}
              placeholder="Choose a username"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {fieldErrors.username ? <Text style={styles.fieldError}>{fieldErrors.username}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(v) => handleChange('email', v)}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(v) => handleChange('password', v)}
              placeholder="Create a password"
              secureTextEntry
            />
            {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text style={styles.link}>Log In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 24, borderRadius: 12 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
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
  fieldError: { color: '#e74c3c', fontSize: 13, marginTop: 4 },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    fontSize: 14,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#7f8c8d' },
  link: { color: '#3498db', fontWeight: '500' },
});
