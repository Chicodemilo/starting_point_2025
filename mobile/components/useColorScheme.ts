// ==============================================================================
// File:      mobile/components/useColorScheme.ts
// Purpose:   Native color scheme hook. Wraps React Native's
//            useColorScheme, normalizing the "unspecified" value to
//            "light" for consistent theme handling.
// Callers:   app/_layout.tsx, (tabs)/_layout.tsx, Themed.tsx
// Callees:   React Native (useColorScheme)
// Modified:  2026-03-01
// ==============================================================================

import { useColorScheme as useColorSchemeCore } from 'react-native';

export const useColorScheme = () => {
  const coreScheme = useColorSchemeCore();
  return coreScheme === 'unspecified' ? 'light' : coreScheme;
};
