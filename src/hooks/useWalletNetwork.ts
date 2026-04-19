import { CHAIN } from '@tonconnect/sdk';
import { useMemo } from 'react';
import { useWalletNetworkContext, type WalletNetwork } from '@/providers/WalletNetworkProvider';

export function useWalletNetwork() {
  const { network, setNetwork } = useWalletNetworkContext();

  const chainId = useMemo(() => {
    return network === 'mainnet' ? CHAIN.MAINNET : CHAIN.TESTNET;
  }, [network]);

  const label = useMemo(() => {
    return network === 'mainnet' ? 'Mainnet' : 'Testnet';
  }, [network]);

  return {
    network,
    setNetwork,
    chainId,
    label,
  } satisfies {
    network: WalletNetwork;
    setNetwork: (network: WalletNetwork) => void;
    chainId: CHAIN;
    label: 'Mainnet' | 'Testnet';
  };
}
