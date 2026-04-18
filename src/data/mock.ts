/** Mock data for the FoxFi demo prototype. Numbers are illustrative. */
export type Token = {
  symbol: string;
  name: string;
  icon: string; // emoji fallback
  priceUsd: number;
  balance: number;
};

export const TOKENS: Token[] = [
  { symbol: "TON", name: "Toncoin", icon: "💎", priceUsd: 5.42, balance: 124.8 },
  { symbol: "USDT", name: "Tether", icon: "💵", priceUsd: 1.0, balance: 320.5 },
  { symbol: "STON", name: "ston.fi", icon: "🟦", priceUsd: 0.74, balance: 88.2 },
  { symbol: "NOT", name: "Notcoin", icon: "🟡", priceUsd: 0.0091, balance: 12450 },
];

export type Pool = {
  id: string;
  pair: string;
  apr: number;
  tvl: string;
  tone: "primary" | "secondary" | "accent";
};

export const POOLS: Pool[] = [
  { id: "ton-usdt", pair: "TON / USDT", apr: 18.4, tvl: "$12.4M", tone: "accent" },
  { id: "ston-ton", pair: "STON / TON", apr: 32.1, tvl: "$3.8M", tone: "primary" },
  { id: "not-ton", pair: "NOT / TON", apr: 24.7, tvl: "$5.1M", tone: "secondary" },
];

export type Quest = {
  id: string;
  title: string;
  hint: string;
  reward: number; // XP
  progress: number; // 0..1
  done?: boolean;
};

export const QUESTS: Quest[] = [
  { id: "q1", title: "Make your first swap", hint: "Trade any token on ston.fi", reward: 50, progress: 0 },
  { id: "q2", title: "Stake 10 TON", hint: "Earn daily rewards with TONStakers", reward: 120, progress: 0.4 },
  { id: "q3", title: "Join a treasure pool", hint: "Add liquidity to any pool", reward: 200, progress: 0 },
  { id: "q4", title: "7-day saving streak", hint: "Open the app daily", reward: 80, progress: 0.71 },
];

export const STAKING = {
  apr: 4.8,
  staked: 42.5,
  rewards: 0.318,
  tvl: "$2.1B",
};
