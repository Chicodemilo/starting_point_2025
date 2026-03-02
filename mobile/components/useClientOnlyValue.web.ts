// ==============================================================================
// File:      mobile/components/useClientOnlyValue.web.ts
// Purpose:   Web implementation of useClientOnlyValue. Returns the
//            server value during SSR and switches to the client value
//            after hydration via useEffect.
// Callers:   (currently unused -- available as utility)
// Callees:   React
// Modified:  2026-03-01
// ==============================================================================

import React from 'react';

// `useEffect` is not invoked during server rendering, meaning
// we can use this to determine if we're on the server or not.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = React.useState<S | C>(server);
  React.useEffect(() => {
    setValue(client);
  }, [client]);

  return value;
}
