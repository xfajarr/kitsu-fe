import axios from 'axios';

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
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      // Could trigger a re-auth flow here
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
  title: string;
  emoji: string | null;
  targetUsd: string;
  currentUsd: string;
  dueDate: string | null;
  isArchived: boolean;
  createdAt: string;
}

// Den types
export interface Den {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  strategy: 'steady' | 'adventurous';
  apr: string;
  totalDeposited: string;
  memberCount: number;
  createdAt: string;
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
  createdAt: string;
}

// API methods
export const apiClient = {
  // Auth
  connect: (address: string, signature: string, timestamp: number) =>
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

  // Goals
  getGoals: () =>
    api.get<ApiResponse<{ goals: Goal[] }>>('/goals'),
  
  createGoal: (data: { title: string; emoji?: string; targetUsd: string; dueDate?: string }) =>
    api.post<ApiResponse<{ goal: Goal }>>('/goals', data),
  
  updateGoal: (id: string, data: Partial<{ title: string; emoji: string; targetUsd: string; dueDate: string | null }>) =>
    api.patch<ApiResponse<{ goal: Goal }>>(`/goals/${id}`, data),
  
  deleteGoal: (id: string) =>
    api.delete<ApiResponse<{ archived: boolean }>>(`/goals/${id}`),

  // Dens
  getDens: () =>
    api.get<ApiResponse<{ dens: Den[] }>>('/dens'),
  
  getMyDens: () =>
    api.get<ApiResponse<{ dens: Den[] }>>('/dens/mine'),
  
  getDen: (id: string) =>
    api.get<ApiResponse<{ den: DenWithMembers }>>(`/dens/${id}`),
  
  createDen: (data: { name: string; emoji?: string; isPublic: boolean; strategy: 'steady' | 'adventurous' }) =>
    api.post<ApiResponse<{ den: Den }>>('/dens', data),
  
  joinDen: (id: string, amountTon: string) =>
    api.post<ApiResponse<{ deposit: { denId: string; amount: string; txParams: { to: string; amount: string; payload: string } } }>>(`/dens/${id}/join`, { amountTon }),
  
  leaveDen: (id: string) =>
    api.post<ApiResponse<{ left: boolean }>>(`/dens/${id}/leave`),

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
  chat: (message: string, context?: { portfolioUsd?: number; goalsCount?: number; densCount?: number; level?: number }) =>
    api.post<ApiResponse<{ reply: string }>>('/ai/chat', { message, context }),
};

export default api;
