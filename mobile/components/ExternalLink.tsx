// ==============================================================================
// File:      mobile/components/ExternalLink.tsx
// Purpose:   Link component for external URLs. On native platforms,
//            opens links in an in-app browser via expo-web-browser
//            instead of the system browser.
// Callers:   EditScreenInfo.tsx
// Callees:   expo-router, expo-web-browser, React Native
// Modified:  2026-03-01
// ==============================================================================

import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

export function ExternalLink(
  props: Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }
) {
  return (
    <Link
      target="_blank"
      {...props}
      href={props.href}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          WebBrowser.openBrowserAsync(props.href as string);
        }
      }}
    />
  );
}
