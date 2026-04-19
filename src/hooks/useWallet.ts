import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useCallback, useMemo } from 'react';

export interface UseWalletReturn {
  address: string | undefined;
  chain: string | undefined;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (tx: {
    validUntil: number;
    messages: Array<{
      address: string;
      amount: string;
      payload?: string;
    }>;
  }) => Promise<{ boc: string } | null>;
  shortenAddress: (addr: string) => string;
}

export function useWallet(): UseWalletReturn {
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const wallet = useTonWallet();

  const connected = useMemo(() => !!wallet, [wallet]);
  const address = useMemo(() => wallet?.account.address, [wallet]);
  const chain = useMemo(() => wallet?.account.chain, [wallet]);
  const connecting = useMemo(() => tonConnectUI.connecting, [tonConnectUI.connecting]);

  const connect = useCallback(async () => {
    try {
      await tonConnectUI.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [tonConnectUI]);

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
    }>;
  }) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await tonConnectUI.sendTransaction(tx);
      return result;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }, [wallet, tonConnectUI]);

  const shortenAddress = useCallback((addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  return {
    address,
    chain,
    connected,
    connecting,
    connect,
    disconnect,
    sendTransaction,
    shortenAddress,
  };
}
