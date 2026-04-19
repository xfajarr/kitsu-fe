import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';

function manifestPathFromEnv(configured: string | undefined): string {
  if (!configured || /^https?:\/\//i.test(configured)) {
    return '/tonconnect-manifest.json';
  }
  return configured.startsWith('/') ? configured : `/${configured}`;
}

function resolveManifestUrl() {
  const configured = import.meta.env.VITE_TONCONNECT_MANIFEST_URL?.trim();

  if (typeof window !== 'undefined') {
    const path = manifestPathFromEnv(configured);

    // Local dev: always load the manifest from the same origin as the SPA. A common mistake is
    // setting VITE_TONCONNECT_MANIFEST_URL to the API (e.g. http://localhost:3001/...) which has
    // no tonconnect-manifest.json → wallet shows "Failed to load manifest: 404".
    if (import.meta.env.DEV) {
      if (configured && /^https?:\/\//i.test(configured)) {
        try {
          if (new URL(configured).origin === window.location.origin) {
            return configured;
          }
        } catch {
          /* fall through to same-origin path */
        }
      }
      return new URL(path, window.location.origin).toString();
    }

    if (configured && /^https?:\/\//i.test(configured)) {
      return configured;
    }
    return new URL(path, window.location.origin).toString();
  }

  return configured || '/tonconnect-manifest.json';
}

interface TonConnectProviderProps {
  children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  return (
    <TonConnectUIProvider
      manifestUrl={resolveManifestUrl()}
      actionsConfiguration={{
        returnStrategy: 'back',
        twaReturnUrl: import.meta.env.VITE_TWA_RETURN_URL,
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
