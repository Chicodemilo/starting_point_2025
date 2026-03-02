import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getTerms, acceptTerms } from '../src/api/auth';
import useAuthStore from '../src/store/authStore';

export default function TermsScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuthStore();
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    getTerms()
      .then(data => setTerms(data.terms))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptTerms();
      await refreshProfile();
      router.replace('/(tabs)');
    } catch {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terms & Conditions</Text>
      <Text style={styles.subtitle}>Please read and accept the terms below to continue.</Text>

      <ScrollView style={styles.termsBox}>
        <Text style={styles.termsText}>{terms?.content || 'No terms available.'}</Text>
      </ScrollView>

      <TouchableOpacity style={[styles.button, accepting && styles.buttonDisabled]} onPress={handleAccept} disabled={accepting}>
        <Text style={styles.buttonText}>{accepting ? 'Accepting...' : 'I Accept the Terms & Conditions'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#2c3e50', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#7f8c8d', marginBottom: 16 },
  termsBox: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: 8, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#dee2e6' },
  termsText: { fontSize: 14, lineHeight: 22, color: '#2c3e50' },
  button: { backgroundColor: '#27ae60', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
