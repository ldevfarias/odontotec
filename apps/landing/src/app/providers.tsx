'use client';

import { useEffect } from 'react';
import { ProgressProvider } from '@bprogress/next/app';

// @bprogress/react's useAnchorProgress attaches click handlers to anchors only
// via MutationObserver — it never calls the handler immediately on mount.
// On a static page, no DOM mutation fires before the user's first click, so
// the progress bar is silently skipped. Triggering one synthetic mutation in
// the next macrotask (after all useEffects have run, including the observer
// setup) forces handleMutation to run and attach handlers before any click.
function ProgressBootstrap() {
  useEffect(() => {
    const id = setTimeout(() => {
      const el = document.createElement('x');
      document.body.appendChild(el);
      document.body.removeChild(el);
    }, 0);
    return () => clearTimeout(id);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider height="3px" color="#41b883" options={{ showSpinner: false }} shallowRouting>
      <ProgressBootstrap />
      {children}
    </ProgressProvider>
  );
}
