import { useTonConnectModal, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useWalletNetwork } from '@/hooks/useWalletNetwork';
import type { WalletNetwork } from '@/providers/WalletNetworkProvider';

export interface UseWalletReturn {
  address: string | undefined;
  chain: string | undefined;
  preferredNetwork: WalletNetwork;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setPreferredNetwork: (network: WalletNetwork) => void;
  sendTransaction: (tx: {
    validUntil: number;
    messages: Array<{
      address: string;
      amount: string;
      payload?: string;
      stateInit?: string;
    }>;
  }) => Promise<{ boc: string } | null>;
  shortenAddress: (addr: string) => string;
}

export function useWallet(): UseWalletReturn {
  const [tonConnectUI] = useTonConnectUI();
  const { open } = useTonConnectModal();
  const wallet = useTonWallet();
  const { network, setNetwork, chainId } = useWalletNetwork();

  const connected = useMemo(() => !!wallet, [wallet]);
  const address = useMemo(() => wallet?.account.address, [wallet]);
  const chain = useMemo(() => wallet?.account.chain, [wallet]);
  const connecting = useMemo(() => tonConnectUI.connecting, [tonConnectUI.connecting]);

  useEffect(() => {
    // TON Connect throws if setConnectionNetwork runs while a session exists; sync after disconnect.
    if (wallet) {
      return;
    }
    tonConnectUI.setConnectionNetwork(chainId);
  }, [chainId, tonConnectUI, wallet]);

  const connect = useCallback(async () => {
    try {
      tonConnectUI.setConnectionNetwork(chainId);
      open();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [chainId, open, tonConnectUI]);

  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }, [tonConnectUI]);

  const sendTransaction = useCallback(async (tx: {
    validUntil: number;
    messages: Array<{
      address: string;
      amount: string;
      payload?: string;
      stateInit?: string;
    }>;
  }) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const validUntil = tx.validUntil > 1_000_000_000_000 ? Math.floor(tx.validUntil / 1000) : tx.validUntil;
      const result = await tonConnectUI.sendTransaction({
        ...tx,
        validUntil,
        network: chainId,
      });
      return result;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }, [chainId, wallet, tonConnectUI]);

  const shortenAddress = useCallback((addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return {
    address,
    chain,
    preferredNetwork: network,
    connected,
    connecting,
    connect,
    disconnect,
    setPreferredNetwork: setNetwork,
    sendTransaction,
    shortenAddress,
  };
}
