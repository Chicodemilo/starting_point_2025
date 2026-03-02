// ==============================================================================
// File:      mobile/src/components/SplashScreen.tsx
// Purpose:   Custom splash screen component shown while the app is
//            loading fonts and initializing auth. Displays the app's
//            first-letter logo, name, and a loading spinner.
// Callers:   app/_layout.tsx
// Callees:   React Native, expo-constants
// Modified:  2026-03-01
// ==============================================================================

import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';

const appName = Constants.expoConfig?.name || 'My App';
const firstLetter = appName.charAt(0).toUpperCase();

export default function SplashScreenView() {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>{firstLetter}</Text>
      </View>
      <Text style={styles.appName}>{appName}</Text>
      <ActivityIndicator size="large" color="#3498db" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 30,
  },
  spinner: {
    marginTop: 10,
  },
});
