// ==============================================================================
// File:      mobile/components/StyledText.tsx
// Purpose:   MonoText component that renders text in the SpaceMono
//            font family. Wraps the themed Text component.
// Callers:   EditScreenInfo.tsx
// Callees:   Themed (Text)
// Modified:  2026-03-01
// ==============================================================================

import { Text, TextProps } from './Themed';

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}
