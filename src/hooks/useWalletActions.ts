import { useCallback } from 'react';
import { useWallet } from './useWallet';

export type WalletActionType = 'deposit' | 'withdraw' | 'swap' | 'transfer' | 'create_goal' | 'join_den';

export interface WalletAction {
  type: WalletActionType;
  amount?: number;
  token?: 'TON' | 'USDT' | 'NEST' | 'GOAL';
  goalId?: string;
  denId?: string;
  recipient?: string;
  description: string;
}

export interface UseWalletActionsReturn {
  executeAction: (action: WalletAction) => Promise<{ boc: string } | null>;
  prepareDeposit: (amount: number, denId: string) => Promise<{ validUntil: number; messages: Array<{ address: string; amount: string }> }>;
  prepareWithdraw: (amount: number, denId: string) => Promise<{ validUntil: number; messages: Array<{ address: string; amount: string }> }>;
  isExecuting: boolean;
}

// Parse natural language to action
export function parseActionFromMessage(message: string): WalletAction | null {
  const m = message.toLowerCase();
  
  // Deposit patterns
  if (m.includes('deposit') || m.includes('save') || m.includes('put in')) {
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(ton|usdt|nest|goal)/i);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1]);
      const token = amountMatch[2]?.toUpperCase() as WalletAction['token'];
      return {
        type: 'deposit',
        amount,
        token: token || 'TON',
        description: `Deposit ${amount} ${token || 'TON'} to Nest Vault`,
      };
    }
    // Just number without token
    const numMatch = message.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      return {
        type: 'deposit',
        amount: parseFloat(numMatch[1]),
        token: 'TON',
        description: `Deposit ${numMatch[1]} TON to Nest Vault`,
      };
    }
  }
  
  // Withdraw patterns
  if (m.includes('withdraw') || m.includes('take out') || m.includes('withdraw from')) {
    const amountMatch = message.match(/(\d+(?:\.\d+)?)/);
    if (amountMatch) {
      return {
        type: 'withdraw',
        amount: parseFloat(amountMatch[1]),
        token: 'TON',
        description: `Withdraw ${amountMatch[1]} TON from Nest Vault`,
      };
    }
  }
  
  // Swap patterns
  if (m.includes('swap') || m.includes('exchange') || m.includes('convert')) {
    const swapMatch = message.match(/(\d+(?:\.\d+)?)\s*(\w+)\s+(?:to|for|into)\s+(\w+)/i);
    if (swapMatch) {
      return {
        type: 'swap',
        amount: parseFloat(swapMatch[1]),
        token: swapMatch[2]?.toUpperCase() as WalletAction['token'],
        description: `Swap ${swapMatch[1]} ${swapMatch[2]} to ${swapMatch[3]}`,
      };
    }
  }
  
  // Transfer patterns
  if (m.includes('send') || m.includes('transfer to')) {
    const toMatch = message.match(/send\s+(\d+(?:\.\d+)?)\s*(\w+)\s+to\s+([UQ][A-Za-z0-9_-]+)/i);
    if (toMatch) {
      return {
        type: 'transfer',
        amount: parseFloat(toMatch[1]),
        token: toMatch[2]?.toUpperCase() as WalletAction['token'],
        recipient: toMatch[3],
        description: `Send ${toMatch[1]} ${toMatch[2]} to ${toMatch[3]}`,
      };
    }
  }
  
  return null;
}

export function useWalletActions(denAddress?: string): UseWalletActionsReturn {
  const { sendTransaction, connected } = useWallet();
  const [tonConnectUI] = useTonConnectUI();
  
  const prepareDeposit = useCallback(async (amount: number, denId: string) => {
    if (!denAddress) {
      throw new Error('No Nest Vault address');
    }
    
    const messages = [{
      address: denAddress,
      amount: (amount * 1e9).toString(), // Convert TON to nanoTON
    }];
    
    return {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages,
    };
  }, [denAddress]);
  
  const prepareWithdraw = useCallback(async (amount: number, denId: string) => {
    if (!denAddress) {
      throw new Error('No Nest Vault address');
    }
    
    // Withdraw requires calling the contract's withdrawal method
    // For now, we'll set up a simple withdrawal
    const messages = [{
      address: denAddress,
      amount: (amount * 1e9).toString(), // Convert TON to nanoTON
    }];
    
    return {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages,
    };
  }, [denAddress]);
  
  const executeAction = useCallback(async (action: WalletAction) => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }
    
    let tx;
    
    if (action.type === 'deposit' && action.amount && denAddress) {
      tx = await prepareDeposit(action.amount, action.denId || '');
    } else if (action.type === 'withdraw' && action.amount && denAddress) {
      tx = await prepareWithdraw(action.amount, action.denId || '');
    } else {
      throw new Error(`Action ${action.type} not implemented yet`);
    }
    
    if (tx) {
      return await sendTransaction(tx);
    }
    
    return null;
  }, [connected, denAddress, prepareDeposit, prepareWithdraw, sendTransaction]);
  
  return {
    executeAction,
    prepareDeposit,
    prepareWithdraw,
    isExecuting: false,
  };
}