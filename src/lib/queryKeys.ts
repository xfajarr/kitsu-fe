// TanStack Query keys for cache management

export const queryKeys = {
  // User
  user: ['user'] as const,
  
  // Portfolio
  portfolio: ['portfolio'] as const,
  prices: ['prices'] as const,
  
  // Goals
  goals: ['goals'] as const,
  goal: (id: string) => ['goals', id] as const,
  
  // Dens
  dens: ['dens'] as const,
  densMine: ['dens', 'mine'] as const,
  den: (id: string) => ['dens', id] as const,
  
  // Quests
  quests: ['quests'] as const,
  
  // Leaderboard
  leaderboard: ['leaderboard'] as const,
  
  // Transactions
  transactions: ['transactions'] as const,
  
  // Balance
  balance: (address: string) => ['balance', address] as const,
} as const;

export type QueryKeys = typeof queryKeys;
