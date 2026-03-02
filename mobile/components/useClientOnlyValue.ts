// ==============================================================================
// File:      mobile/components/useClientOnlyValue.ts
// Purpose:   Native implementation of useClientOnlyValue. Always
//            returns the client value since native does not support
//            server rendering.
// Callers:   (currently unused -- available as utility)
// Callees:   (none)
// Modified:  2026-03-01
// ==============================================================================

// This function is web-only as native doesn't currently support server (or build-time) rendering.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return client;
}
