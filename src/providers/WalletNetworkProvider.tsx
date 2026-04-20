import * as React from 'react';

export type WalletNetwork = 'testnet' | 'mainnet';

type WalletNetworkContextValue = {
  network: WalletNetwork;
  setNetwork: (network: WalletNetwork) => void;
};

export const WALLET_NETWORK_STORAGE_KEY = 'kitsu.wallet-network';

const WalletNetworkContext = React.createContext<WalletNetworkContextValue | null>(null);

function getInitialNetwork(): WalletNetwork {
  if (typeof window === 'undefined') {
    return 'testnet';
  }

  const stored = window.localStorage.getItem(WALLET_NETWORK_STORAGE_KEY);
  return stored === 'mainnet' ? 'mainnet' : 'testnet';
}

export function WalletNetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = React.useState<WalletNetwork>(getInitialNetwork);

  const setNetwork = React.useCallback((nextNetwork: WalletNetwork) => {
    setNetworkState(nextNetwork);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(WALLET_NETWORK_STORAGE_KEY, nextNetwork);
    }
  }, []);

  const value = React.useMemo(() => ({ network, setNetwork }), [network, setNetwork]);

  return <WalletNetworkContext.Provider value={value}>{children}</WalletNetworkContext.Provider>;
}

export function useWalletNetworkContext() {
  const context = React.useContext(WalletNetworkContext);
  if (!context) {
    throw new Error('useWalletNetworkContext must be used within WalletNetworkProvider');
  }
  return context;
}
