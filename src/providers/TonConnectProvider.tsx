import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';

function resolveManifestUrl() {
  const configured = import.meta.env.VITE_TONCONNECT_MANIFEST_URL?.trim();

  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }

  if (typeof window !== 'undefined') {
    return new URL(configured || '/tonconnect-manifest.json', window.location.origin).toString();
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
