// ==============================================================================
// File:      mobile/components/useColorScheme.web.ts
// Purpose:   Web implementation of useColorScheme. Always returns
//            "light" because React Native styling does not support
//            server-rendered color scheme detection.
// Callers:   Themed.tsx (on web platform)
// Callees:   (none)
// Modified:  2026-03-01
// ==============================================================================

// NOTE: The default React Native styling doesn't support server rendering.
// Server rendered styles should not change between the first render of the HTML
// and the first render on the client. Typically, web developers will use CSS media queries
// to render different styles on the client and server, these aren't directly supported in React Native
// but can be achieved using a styling library like Nativewind.
export function useColorScheme() {
  return 'light';
}
