/** Mock data for the FoxFi demo prototype. Numbers are illustrative. */
export type Token = {
  symbol: string;
  name: string;
  icon: string; // emoji fallback
  priceUsd: number;
  balance: number;
  change24h: number;
};

export const TOKENS: Token[] = [
  { symbol: "TON", name: "Toncoin", icon: "💎", priceUsd: 5.42, balance: 124.8, change24h: 2.4 },
  { symbol: "USDT", name: "Tether", icon: "💵", priceUsd: 1.0, balance: 320.5, change24h: 0.0 },
  { symbol: "STON", name: "ston.fi", icon: "🟦", priceUsd: 0.74, balance: 88.2, change24h: -1.2 },
  { symbol: "NOT", name: "Notcoin", icon: "🟡", priceUsd: 0.0091, balance: 12450, change24h: 5.7 },
];

/** Money Dens — the friendly name for vaults.
 * Behind the scenes: "stake" = TONStakers, "pool" = ston.fi LP. We never expose that wording. */
export type Den = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  visibility: "public" | "private";
  /** Hidden strategy — used for rough APR display logic only. */
  strategy: "stake" | "pool";
  apr: number;
  totalDeposited: number; // in USD
  members: number;
  ownerName: string;
  isOwner?: boolean;
  myDeposit: number; // user's deposit in USD
  tone: "primary" | "secondary" | "accent";
};

export const DENS: Den[] = [
  {
    id: "den-rainy-day",
    name: "Rainy Day Den",
    emoji: "☔",
    description: "Slow & steady savings. A cozy spot to grow your TON safely.",
    visibility: "public",
    strategy: "stake",
    apr: 4.8,
    totalDeposited: 184_320,
    members: 1284,
    ownerName: "Foxy Team",
    myDeposit: 230,
    tone: "accent",
  },
  {
    id: "den-treasure-hunt",
    name: "Treasure Hunters",
    emoji: "🗺️",
    description: "Higher rewards for adventurous savers. A bit more bumpy.",
    visibility: "public",
    strategy: "pool",
    apr: 18.4,
    totalDeposited: 92_540,
    members: 612,
    ownerName: "Captain Vix",
    myDeposit: 0,
    tone: "primary",
  },
  {
    id: "den-friends",
    name: "Friday Squad",
    emoji: "🍕",
    description: "Saving with the gang for our trip.",
    visibility: "private",
    strategy: "stake",
    apr: 4.8,
    totalDeposited: 1_240,
    members: 6,
    ownerName: "You",
    isOwner: true,
    myDeposit: 410,
    tone: "secondary",
  },
  {
    id: "den-coffee",
    name: "Skip-the-Coffee Club",
    emoji: "☕",
    description: "Tiny daily deposits. Big yearly surprises.",
    visibility: "public",
    strategy: "stake",
    apr: 4.8,
    totalDeposited: 38_900,
    members: 421,
    ownerName: "Mocha",
    myDeposit: 0,
    tone: "secondary",
  },
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
  { id: "q1", title: "Deposit into your first Den", hint: "Pick any public den to start", reward: 80, progress: 0.5 },
  { id: "q2", title: "Set a savings goal", hint: "Plan your dream and let Foxy help", reward: 120, progress: 0 },
  { id: "q3", title: "Invite a friend to your Den", hint: "Save together, win together", reward: 200, progress: 0 },
  { id: "q4", title: "7-day saving streak", hint: "Open the app daily", reward: 80, progress: 0.71 },
];

/** User goals (savings targets). */
export type Goal = {
  id: string;
  title: string;
  emoji: string;
  targetUsd: number;
  savedUsd: number;
  dueLabel: string;
  tone: "primary" | "secondary" | "accent";
};

export const GOALS: Goal[] = [
  { id: "g1", title: "New laptop", emoji: "💻", targetUsd: 1500, savedUsd: 640, dueLabel: "Aug 2026", tone: "accent" },
  { id: "g2", title: "Trip to Japan", emoji: "🗾", targetUsd: 3000, savedUsd: 410, dueLabel: "Mar 2027", tone: "primary" },
  { id: "g3", title: "Emergency fund", emoji: "🛟", targetUsd: 2000, savedUsd: 1820, dueLabel: "Ongoing", tone: "secondary" },
];

/** Recent activity feed. */
export type Activity = {
  id: string;
  kind: "deposit" | "reward" | "goal" | "quest" | "join";
  title: string;
  subtitle: string;
  amountUsd?: number;
  whenLabel: string;
};

export const ACTIVITIES: Activity[] = [
  { id: "a1", kind: "reward", title: "Earned reward", subtitle: "Rainy Day Den", amountUsd: 0.42, whenLabel: "2h ago" },
  { id: "a2", kind: "deposit", title: "Deposit", subtitle: "Friday Squad", amountUsd: 50, whenLabel: "Yesterday" },
  { id: "a3", kind: "quest", title: "Quest completed", subtitle: "+80 XP · Daily login", whenLabel: "Yesterday" },
  { id: "a4", kind: "join", title: "Joined a den", subtitle: "Rainy Day Den", whenLabel: "3d ago" },
  { id: "a5", kind: "goal", title: "Goal updated", subtitle: "New laptop · 42% reached", whenLabel: "5d ago" },
];

/** Leaderboard (mock). */
export type LeaderRow = {
  rank: number;
  name: string;
  emoji: string;
  xp: number;
  isMe?: boolean;
};

export const LEADERBOARD: LeaderRow[] = [
  { rank: 1, name: "MochaFox", emoji: "🦊", xp: 12480 },
  { rank: 2, name: "TonHero", emoji: "🦸", xp: 10920 },
  { rank: 3, name: "Sakura", emoji: "🌸", xp: 9870 },
  { rank: 4, name: "Captain Vix", emoji: "🧭", xp: 8540 },
  { rank: 5, name: "Alex (You)", emoji: "⭐", xp: 4220, isMe: true },
  { rank: 6, name: "Pixel", emoji: "🎮", xp: 3980 },
  { rank: 7, name: "NoodleKing", emoji: "🍜", xp: 3110 },
];

export const PROFILE = {
  name: "Alex",
  handle: "@alex.ton",
  level: 7,
  xp: 420,
  xpNext: 750,
  streak: 5,
  joinedLabel: "Joined Mar 2026",
  totalSavedUsd: 1280,
  totalEarnedUsd: 38.42,
  trophies: 12,
};
