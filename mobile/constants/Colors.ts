// ==============================================================================
// File:      mobile/constants/Colors.ts
// Purpose:   Color palette constants for light and dark themes.
//            Defines text, background, tint, and tab icon colors
//            used throughout the app via the Themed components.
// Callers:   Themed.tsx, (tabs)/_layout.tsx, EditScreenInfo.tsx
// Callees:   (none)
// Modified:  2026-03-01
// ==============================================================================

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
