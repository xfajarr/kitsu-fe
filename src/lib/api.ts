import axios from 'axios';
import { WALLET_NETWORK_STORAGE_KEY } from '@/providers/WalletNetworkProvider';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    const network = localStorage.getItem(WALLET_NETWORK_STORAGE_KEY) || 'testnet';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-TON-Network'] = network;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.dispatchEvent(new Event('kitsu-auth-change'));
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// User types
export interface User {
  id: string;
  walletAddr: string;
  isAdmin: boolean;
  username: string | null;
  tonHandle: string | null;
  xp: number;
  level: number;
  streakDays: number;
  createdAt: string;
}

// Goal types
export interface Goal {
  id: string;
  userId?: string;
  title: string;
  description: string | null;
  emoji: string | null;
  visibility: 'private' | 'public';
  strategy: 'tonstakers' | 'stonfi';
  contractAddress: string | null;
  targetTon: string;
  currentTon: string;
  targetUsd: string;
  currentUsd: string;
  principalTon?: string;
  yieldTon?: string;
  vaultValueTon?: string;
  totalPrincipalTon?: string;
  totalYieldTon?: string;
  canClaim?: boolean;
  canUnwind?: boolean;
  tsTonBalance?: string | null;
  projectedVaultValueTon?: string | null;
  liquidTonBalance?: string;
  syncYieldTon?: string | null;
  isOnchainSynced?: boolean;
  isLiveValue?: boolean;
  lastStrategySyncTime?: string | null;
  dueDate: string | null;
  isArchived: boolean;
  createdAt: string;
}

export interface WithdrawResponse {
  left?: boolean;
  amount?: string;
  txParams: TonConnectTxParams;
}

export interface TonConnectTxParams {
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
  }>;
}

export interface DenDepositPreparation {
  denId: string;
  amount: string;
  confirmationToken: string;
  txParams: TonConnectTxParams;
}

export interface DenDepositConfirmation {
  denId: string;
  amount: string;
  confirmed: boolean;
  txHash: string;
}

// Den types
export interface Den {
  id: string;
  ownerId: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  strategy: 'steady' | 'adventurous';
  contractAddress: string | null;
  apr: string;
  totalDeposited: string;
  vaultValueTon?: string;
  totalYieldTon?: string;
  memberCount: number;
  createdAt: string;
  /** Present on GET /dens/mine — user's total deposited TON in this den */
  myDepositTon?: string;
  myCurrentTon?: string;
  myYieldTon?: string;
  mySharesTon?: string;
  canWithdraw?: boolean;
  canUnwind?: boolean;
  tsTonBalance?: string;
  projectedVaultValueTon?: string;
  liquidTonBalance?: string;
  syncYieldTon?: string;
  isOnchainSynced?: boolean;
  isLiveValue?: boolean;
  lastStrategySyncTime?: string | null;
}

export interface DenWithMembers extends Den {
  members: Array<{
    userId: string;
    username: string;
    amount: string;
  }>;
}

// Portfolio types
export interface Portfolio {
  totalUsd: number;
  dayChangePct: number;
  assets: Array<{
    symbol: string;
    balance: number;
    priceUsd: number;
    change24h: number;
    valueUsd: number;
  }>;
}

// Quest types
export interface Quest {
  id: string;
  questKey: string;
  title: string;
  hint: string;
  reward: number;
  progress: number;
  completed: boolean;
}

// Transaction types
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'stake' | 'unstake';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  txParams?: TonConnectTxParams;
  createdAt: string;
}

export interface StonfiToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  kind: 'ton' | 'jetton';
  network: 'testnet' | 'mainnet';
}

export interface StonfiQuote {
  quoteId: string;
  resolverId: string;
  resolverName: string;
  offerToken: StonfiToken;
  askToken: StonfiToken;
  offerUnits: string;
  askUnits: string;
  offerDisplay: string;
  askDisplay: string;
  protocolFeeUnits: string;
  referrerFeeUnits: string;
  rawQuote: unknown;
}

export interface StonfiConfig {
  network: 'testnet' | 'mainnet';
  chainId: '-3' | '-239';
  tokens: StonfiToken[];
  omnistonApiUrl: string;
  supported: {
    quote: boolean;
    buildTransfer: boolean;
    trackTrade: boolean;
    widget: boolean;
  };
}

export interface StonfiPool {
  id: string;
  network: 'testnet' | 'mainnet';
  token0: StonfiToken;
  token1: StonfiToken;
  label: string;
  kind: 'swap-pair';
}

export interface StonfiWalletAsset {
  token: StonfiToken;
  balanceUnits: string;
  balanceDisplay: string;
}

// API methods
export const apiClient = {
  // Auth
  connect: (address: string, signature?: string, timestamp?: number) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/connect', { address, signature, timestamp }),
  
  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),

  // Users
  getUser: (id: string) =>
    api.get<ApiResponse<{ user: User }>>(`/users/${id}`),
  
  updateProfile: (data: { username?: string; tonHandle?: string }) =>
    api.patch<ApiResponse<{ user: User }>>('/users/me', data),
  
  getLeaderboard: () =>
    api.get<ApiResponse<{ leaderboard: Array<{ rank: number; userId: string; username: string; xp: number; level: number }> }>>('/users/leaderboard'),

  // STON.fi
  getStonfiConfig: () =>
    api.get<ApiResponse<{ config: StonfiConfig }>>('/stonfi/config'),

  getStonfiAssets: () =>
    api.get<ApiResponse<{ assets: StonfiToken[] }>>('/stonfi/assets'),

  getStonfiPools: () =>
    api.get<ApiResponse<{ pools: StonfiPool[] }>>('/stonfi/pools'),

  getStonfiWalletAssets: (address: string) =>
    api.get<ApiResponse<{ assets: StonfiWalletAsset[] }>>(`/stonfi/wallet-assets/${address}`),

  quoteStonfiSwap: (data: { offerToken: string; askToken: string; amount: string }) =>
    api.post<ApiResponse<{ quote: StonfiQuote }>>('/stonfi/quote', data),

  buildStonfiSwap: (data: { offerToken: string; askToken: string; sourceAddress: string; destinationAddress?: string; quote: unknown }) =>
    api.post<ApiResponse<{ swap: { quoteId: string; txParams: TonConnectTxParams } }>>('/stonfi/build-transfer', data),

  trackStonfiSwap: (data: { quoteId: string; walletAddress: string; txBoc: string }) =>
    api.post<ApiResponse<{ trade: { txHash: string; status: string } }>>('/stonfi/track', data),

  // Goals
  getGoals: () =>
    api.get<ApiResponse<{ goals: Goal[] }>>('/goals'),

  getPublicGoals: () =>
    api.get<ApiResponse<{ goals: Goal[] }>>('/goals/public'),
  
  createGoal: (data: { title: string; description?: string; emoji?: string; targetTon: string; visibility: 'private' | 'public'; strategy: 'tonstakers' | 'stonfi'; dueDate?: string }) =>
    api.post<ApiResponse<{ goal: Goal; txParams: TonConnectTxParams; configureAfterDeploy?: boolean }>>('/goals', data),

  configureGoal: (id: string) =>
    api.post<ApiResponse<{ configure: { goalId: string; goalAddress: string; txParams: TonConnectTxParams } }>>(`/goals/${id}/configure`),
  
  updateGoal: (id: string, data: Partial<{ title: string; description: string; emoji: string; targetTon: string; visibility: 'private' | 'public'; strategy: 'tonstakers' | 'stonfi'; dueDate: string | null }>) =>
    api.patch<ApiResponse<{ goal: Goal }>>(`/goals/${id}`, data),
  
  deleteGoal: (id: string) =>
    api.delete<ApiResponse<{ archived: boolean }>>(`/goals/${id}`),

  depositGoal: (id: string, amountTon: string) =>
    api.post<ApiResponse<{ deposit: { goalId: string; amount: string; txParams: TonConnectTxParams } }>>(`/goals/${id}/deposit`, { amountTon }),

  claimGoal: (id: string) =>
    api.post<ApiResponse<{ claim: { goalId: string; txParams: TonConnectTxParams } }>>(`/goals/${id}/claim`),

  syncGoal: (id: string) =>
    api.post<ApiResponse<{ sync: { goalId: string; amount: string; txParams: TonConnectTxParams } }>>(`/goals/${id}/sync`),

  unwindGoal: (id: string, mode: 'standard' | 'instant' | 'best-rate' = 'best-rate') =>
    api.post<ApiResponse<{ unwind: { goalId: string; amount: string; mode: string; txParams: TonConnectTxParams } }>>(`/goals/${id}/unwind`, { mode }),

  // Dens
  getDens: () =>
    api.get<ApiResponse<{ dens: Den[] }>>('/dens'),
  
  getMyDens: () =>
    api.get<ApiResponse<{ dens: Den[] }>>('/dens/mine'),
  
  getDen: (id: string) =>
    api.get<ApiResponse<{ den: DenWithMembers }>>(`/dens/${id}`),
  
  createDen: (data: { name: string; emoji?: string; isPublic: boolean; strategy: 'steady' | 'adventurous'; contractAddress?: string }) =>
    api.post<ApiResponse<{ den: Den; txParams: TonConnectTxParams }>>('/dens', data),
  
  joinDen: (id: string, amountTon: string) =>
    api.post<ApiResponse<{ deposit: DenDepositPreparation }>>(`/dens/${id}/join`, { amountTon }),

  confirmJoinDen: (id: string, data: { confirmationToken: string; txBoc: string }) =>
    api.post<ApiResponse<{ deposit: DenDepositConfirmation }>>(`/dens/${id}/join/confirm`, data),

  syncDen: (id: string) =>
    api.post<ApiResponse<{ sync: { denId: string; amount: string; txParams: TonConnectTxParams } }>>(`/dens/${id}/sync`),

  unwindDen: (id: string, mode: 'standard' | 'instant' | 'best-rate' = 'best-rate') =>
    api.post<ApiResponse<{ unwind: { denId: string; amount: string; mode: string; txParams: TonConnectTxParams } }>>(`/dens/${id}/unwind`, { mode }),
  
  leaveDen: (id: string) =>
    api.post<ApiResponse<WithdrawResponse>>(`/dens/${id}/leave`),

  // Portfolio
  getPortfolio: () =>
    api.get<ApiResponse<{ portfolio: Portfolio }>>('/portfolio'),
  
  getPrices: () =>
    api.get<ApiResponse<{ prices: Record<string, { usd: number; change24h: number }> }>>('/portfolio/prices'),

  // Transactions
  deposit: (data: { type: 'vault' | 'goal' | 'den'; targetId: string; amountTon: string }) =>
    api.post<ApiResponse<{ transaction: Transaction }>>('/transactions/deposit', data),
  
  withdraw: (data: { type: 'vault' | 'goal' | 'den'; sourceId: string; amountTon: string }) =>
    api.post<ApiResponse<{ transaction: Transaction }>>('/transactions/withdraw', data),
  
  getTransactionHistory: () =>
    api.get<ApiResponse<{ transactions: Transaction[] }>>('/transactions/history'),

  // Quests
  getQuests: () =>
    api.get<ApiResponse<{ quests: Quest[] }>>('/quests'),
  
  claimQuest: (id: string) =>
    api.post<ApiResponse<{ claimed: boolean; xpAwarded: number; newTotalXp: number }>>(`/quests/${id}/claim`),

  // AI Chat
  chat: (
    message: string, 
    context?: { portfolioUsd?: number; goalsCount?: number; densCount?: number; level?: number },
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ) =>
    api.post<ApiResponse<{ reply: string }>>('/ai/chat', { message, context, history }),
};

export default api;
