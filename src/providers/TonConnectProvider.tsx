import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { ReactNode } from 'react';

const manifestUrl = import.meta.env.VITE_TONCONNECT_MANIFEST_URL || '/tonconnect-manifest.json';

interface TonConnectProviderProps {
  children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      walletsListConfiguration={{
        includeWallets: [
          {
            appName: "tonkeeper",
            name: "Tonkeeper",
            imageUrl: "https://tonkeeper.com/assets/tonconnect-icon.png",
            platforms: ["ios", "android", "chrome", "firefox"],
          },
          {
            appName: "mytonwallet",
            name: "MyTonWallet",
            imageUrl: "https://static.mytonwallet.io/icon-256.png",
            platforms: ["chrome", "windows", "macos", "linux"],
          },
          {
            appName: "tonwallet",
            name: "TON Wallet",
            imageUrl: "https://wallet.ton.org/assets/ui/ton_logo.png",
            platforms: ["chrome"],
          },
        ],
      }}
      actionsConfiguration={{
        twaReturnUrl: import.meta.env.VITE_TWA_RETURN_URL,
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
