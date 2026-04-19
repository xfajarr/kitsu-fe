import * as React from "react";
import { PopButton } from "@/components/PopButton";
import { XPBar } from "@/components/XPBar";
import {
  Trophy,
  Target,
  Activity as ActivityIcon,
  Wallet,
  Plus,
  X,
  Flame,
  Sparkles,
  TrendingUp,
  ArrowDownToLine,
  Crown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useUser,
  usePortfolio,
  useGoals,
  useCreateGoal,
  useLeaderboard,
  useTransactions,
  useDeposit,
} from "@/hooks/queries";
import { useAuthToken } from "@/hooks/useAuthToken";
import { useWallet } from "@/hooks/useWallet";
import type { Goal, Transaction, Portfolio } from "@/lib/api";
import { calculateLevelFromXp } from "@/lib/gamification";
import { format } from "date-fns";

type Section = "overview" | "assets" | "goals" | "leaderboard" | "activity";

export const ProfileScreen: React.FC = () => {
  const token = useAuthToken();
  const [section, setSection] = React.useState<Section>("overview");
  const [creatingGoal, setCreatingGoal] = React.useState(false);
  const { connected, sendTransaction } = useWallet();

  const { data: user, isLoading: userLoading } = useUser();
  const { data: portfolio } = usePortfolio();
  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const { data: leaderboard = [], isLoading: lbLoading } = useLeaderboard();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const createGoal = useCreateGoal();
  const depositMut = useDeposit();

  const portfolioUsd = portfolio?.totalUsd ?? 0;
  const savedUsd = goals.reduce((s, g) => s + parseFloat(g.currentUsd || "0"), 0);

  const levelInfo = user ? calculateLevelFromXp(user.xp) : null;
  const xpPct = levelInfo && levelInfo.xpForNext + levelInfo.xpInLevel > 0
    ? levelInfo.xpInLevel / (levelInfo.xpInLevel + levelInfo.xpForNext)
    : 0;

  const displayName = user?.username || user?.tonHandle || "Saver";
  const handle = user?.tonHandle ? `@${user.tonHandle}` : user?.walletAddr ? `· ${user.walletAddr.slice(0, 6)}…` : "";
  const joinedLabel = user?.createdAt
    ? `Joined ${format(new Date(user.createdAt), "MMM yyyy")}`
    : "";

  const addGoal = async (g: { title: string; description?: string; emoji: string; targetTon: number; visibility: 'private' | 'public'; strategy: 'tonstakers' | 'stonfi'; dueDate?: string }) => {
    if (!connected) {
      toast.error("Connect your wallet first.");
      return;
    }

    try {
      const result = await createGoal.mutateAsync({
        title: g.title,
        description: g.description,
        emoji: g.emoji || undefined,
        targetTon: g.targetTon.toFixed(8),
        visibility: g.visibility,
        strategy: g.strategy,
        dueDate: g.dueDate,
      });
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.txParams.messages,
      });
      setCreatingGoal(false);
      toast.success("Goal added! Foxy will help you crush it 🎯");
    } catch {
      toast.error("Could not create goal.");
    }
  };

  if (!token) {
    return (
      <div className="px-4 pt-2 pb-28 animate-fade-in space-y-5">
        <div className="game-card p-8 text-center">
          <p className="font-display font-bold text-lg">Profile</p>
          <p className="text-sm text-muted-foreground mt-2">
            Connect your wallet and sign in to see your goals, leaderboard rank, and activity.
          </p>
        </div>
      </div>
    );
  }

  if (userLoading && !user) {
    return (
      <div className="px-4 pt-2 pb-28 flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 pt-2 pb-28 flex items-center justify-center min-h-[320px]">
        <p className="text-sm text-muted-foreground text-center">Could not load your profile. Try reconnecting your wallet.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-28 animate-fade-in space-y-5">
      {/* Profile header */}
      <section className="game-card p-5 relative overflow-hidden">
        <div aria-hidden className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-secondary-soft" />
        <div className="relative flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-soft border-2 border-primary/40 flex items-center justify-center text-3xl shrink-0">
            🦊
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl font-bold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {handle} {joinedLabel}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60">
                <Trophy className="w-3 h-3" /> Lv {user.level}
              </span>
              <span className="chip bg-warning/30 text-warning-foreground border border-warning/60">
                <Flame className="w-3 h-3" /> {user.streakDays}d
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="flex justify-between text-[11px] font-bold text-muted-foreground tabular-nums mb-1">
            <span>{user.xp} XP</span>
            <span>Next level: ~{Math.max(0, Math.round(levelInfo?.xpForNext ?? 0))} XP to go</span>
          </div>
          <XPBar value={xpPct} tone="secondary" />
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Wealth" value={`$${portfolioUsd.toFixed(0)}`} />
          <Stat label="Saved" value={`$${savedUsd.toFixed(0)}`} />
          <Stat label="XP" value={user.xp.toLocaleString()} />
        </div>
      </section>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {(
          [
            { k: "overview", label: "Overview", Icon: Sparkles },
            { k: "assets", label: "Coins", Icon: Wallet },
            { k: "goals", label: "Goals", Icon: Target },
            { k: "leaderboard", label: "Ranks", Icon: Trophy },
            { k: "activity", label: "Activity", Icon: ActivityIcon },
          ] as const
        ).map(({ k, label, Icon }) => (
          <button
            key={k}
            onClick={() => setSection(k)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-2xl border-2 px-3 py-1.5 font-display font-bold text-sm press-effect",
              section === k
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border",
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {section === "overview" && (
        <OverviewSection
          goals={goals}
          goalsLoading={goalsLoading}
          userId={user.id}
          leaderboard={leaderboard}
          lbLoading={lbLoading}
          transactions={transactions}
          txLoading={txLoading}
        />
      )}
      {section === "assets" && <AssetsSection portfolioUsd={portfolioUsd} portfolio={portfolio} />}
      {section === "goals" && (
        <GoalsSection
          goals={goals}
          goalsLoading={goalsLoading}
          onAdd={() => setCreatingGoal(true)}
          onDepositTon={async (id, amountTon) => {
            try {
              const tx = await depositMut.mutateAsync({ type: "goal", targetId: id, amountTon: amountTon.toFixed(8) });
              if (!tx.txParams) {
                throw new Error("Missing transaction params");
              }
              await sendTransaction({
                validUntil: Date.now() + 5 * 60 * 1000,
                messages: tx.txParams.messages,
              });
              toast.success(`+${amountTon} TON toward your goal`);
            } catch {
              toast.error("Deposit failed.");
            }
          }}
        />
      )}
      {section === "leaderboard" && <LeaderboardSection rows={leaderboard} loading={lbLoading} userId={user.id} />}
      {section === "activity" && <ActivitySection txs={transactions} loading={txLoading} />}

      {creatingGoal && <CreateGoalSheet onClose={() => setCreatingGoal(false)} onCreate={addGoal} />}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-card rounded-2xl border-2 border-border p-2">
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
    <p className="font-display font-bold tabular-nums text-sm">{value}</p>
  </div>
);

const OverviewSection: React.FC<{
  goals: Goal[];
  goalsLoading: boolean;
  userId: string;
  leaderboard: Array<{ rank: number; userId: string; username: string; xp: number; level: number }>;
  lbLoading: boolean;
  transactions: Transaction[];
  txLoading: boolean;
}> = ({ goals, goalsLoading, userId, leaderboard, lbLoading, transactions, txLoading }) => {
  const top = goals[0];
  const recent = transactions.slice(0, 5);
  const me = leaderboard.find((r) => r.userId === userId);

  if (goalsLoading || lbLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {top && (
        <article className="game-card p-4">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold inline-flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-deep" /> Top goal
            </p>
            <span className="text-xs text-muted-foreground">
              {top.dueDate ? format(new Date(top.dueDate), "MMM yyyy") : "Ongoing"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-2xl">{top.emoji || "🎯"}</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold truncate">{top.title}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                ${parseFloat(top.currentUsd).toFixed(0)} of ${parseFloat(top.targetUsd).toFixed(0)}
              </p>
              <XPBar
                className="mt-1"
                value={parseFloat(top.targetUsd) > 0 ? parseFloat(top.currentUsd) / parseFloat(top.targetUsd) : 0}
                tone="primary"
              />
            </div>
          </div>
        </article>
      )}

      {me && (
        <article className="game-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary-soft border-2 border-secondary/60 flex items-center justify-center text-2xl">
            <Trophy className="w-6 h-6 text-secondary-deep" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold">You&apos;re rank #{me.rank}</p>
            <p className="text-xs text-muted-foreground">Keep saving to climb the leaderboard!</p>
          </div>
          <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60 tabular-nums">
            {me.xp.toLocaleString()} XP
          </span>
        </article>
      )}

      <article>
        <p className="font-display font-bold mb-2 inline-flex items-center gap-2 px-1">
          <ActivityIcon className="w-4 h-4 text-accent-deep" /> Recent activity
        </p>
        <div className="game-card divide-y divide-border">
          {txLoading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recent.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No activity yet.</p>
          ) : (
            recent.map((t) => <TxRow key={t.id} t={t} />)
          )}
        </div>
      </article>
    </div>
  );
};

const AssetsSection: React.FC<{
  portfolioUsd: number;
  portfolio: Portfolio | undefined;
}> = ({ portfolioUsd, portfolio }) => (
  <div className="space-y-3">
    <article className="game-card p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">Total balance</p>
      <p className="font-display text-3xl font-bold tabular-nums">
        ${portfolioUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
    </article>
    <div className="game-card divide-y divide-border">
      {portfolio?.assets && portfolio.assets.length > 0 ? (
        portfolio.assets.map((t) => {
          const valueUsd = t.valueUsd;
          const up = t.change24h >= 0;
          return (
            <div key={t.symbol} className="flex items-center gap-3 p-3">
              <AssetIcon symbol={t.symbol} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-sm truncate">{t.symbol}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {t.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-sm tabular-nums">
                      ${valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className={cn("text-[11px] font-bold tabular-nums", up ? "text-success-foreground" : "text-destructive")}>
                      {up ? "+" : ""}
                      {t.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="p-6 text-sm text-muted-foreground text-center">No assets yet.</p>
      )}
    </div>
  </div>
);

function AssetIcon({ symbol }: { symbol: string }) {
  const s = symbol.toUpperCase();
  if (s === "TON") {
    return (
      <div className="w-11 h-11 rounded-2xl bg-muted border-2 border-border flex items-center justify-center shrink-0 p-1.5">
        <img src="/TON-white-icon.svg" alt="" className="w-8 h-8 object-contain" />
      </div>
    );
  }
  if (s === "USDT" || s === "USD₮") {
    return (
      <div className="w-11 h-11 rounded-2xl bg-muted border-2 border-border flex items-center justify-center shrink-0 p-1.5">
        <img src="/tether-usdt-logo.svg" alt="" className="w-8 h-8 object-contain" />
      </div>
    );
  }
  return (
    <div className="w-11 h-11 rounded-2xl bg-muted border-2 border-border flex items-center justify-center shrink-0">
      <img src="/placeholder.svg" alt="" className="w-7 h-7 object-contain opacity-80" />
    </div>
  );
}

const GoalsSection: React.FC<{
  goals: Goal[];
  goalsLoading: boolean;
  onAdd: () => void;
  onDepositTon: (id: string, amountTon: number) => void;
}> = ({ goals, goalsLoading, onAdd, onDepositTon }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <p className="font-display font-bold inline-flex items-center gap-2">
        <Target className="w-4 h-4 text-primary-deep" /> Your goals
      </p>
      <PopButton size="sm" tone="primary" onClick={onAdd}>
        <Plus className="w-4 h-4" /> New goal
      </PopButton>
    </div>

    {goalsLoading ? (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ) : goals.length === 0 ? (
      <div className="game-card p-6 text-center">
        <p className="font-display font-bold">No goals yet</p>
        <p className="text-sm text-muted-foreground">Set one and Foxy will cheer you on.</p>
      </div>
    ) : (
      goals.map((g) => {
        const target = parseFloat(g.targetTon || "0");
        const cur = parseFloat(g.currentTon || "0");
        const pct = target > 0 ? cur / target : 0;
        return (
          <article key={g.id} className="game-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-soft border-2 border-primary/40 flex items-center justify-center text-2xl shrink-0">
                {g.emoji || "🎯"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-bold truncate">{g.title}</p>
                  <span className="text-xs text-muted-foreground">
                    {g.dueDate ? format(new Date(g.dueDate), "MMM yyyy") : "Ongoing"}
                  </span>
                </div>
                {g.description && <p className="text-xs text-muted-foreground mt-1">{g.description}</p>}
                <p className="text-xs text-muted-foreground tabular-nums">
                  {cur.toLocaleString()} TON of {target.toLocaleString()} TON ({Math.round(pct * 100)}%)
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 capitalize">
                  {g.visibility} goal via {g.strategy}
                </p>
                <XPBar className="mt-2" value={pct} tone="primary" />
                <div className="flex gap-2 mt-3">
                  {[0.1, 0.5, 1].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => onDepositTon(g.id, amt)}
                      className="flex-1 rounded-2xl border-2 border-border bg-card py-1.5 text-xs font-display font-bold press-effect"
                    >
                      +{amt} TON
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>
        );
      })
    )}
  </div>
);

const CreateGoalSheet: React.FC<{
  onClose: () => void;
  onCreate: (g: { title: string; description?: string; emoji: string; targetTon: number; visibility: 'private' | 'public'; strategy: 'tonstakers' | 'stonfi'; dueDate?: string }) => void | Promise<void>;
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [emoji, setEmoji] = React.useState("🎯");
  const [target, setTarget] = React.useState(10);
  const [visibility, setVisibility] = React.useState<'private' | 'public'>("private");
  const [strategy, setStrategy] = React.useState<'tonstakers' | 'stonfi'>("tonstakers");
  const [dueDate, setDueDate] = React.useState("");
  const choices = ["🎯", "💻", "🗾", "🛟", "🏠", "🎓", "🚗", "💍"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create goal"
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-t-3xl border-t-2 border-x-2 border-border p-5 pb-8 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <p className="font-display text-xl font-bold">New goal</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center press-effect"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">What for?</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New laptop"
            className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary"
          />
        </label>

        <label className="block mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why are you saving for this?"
            className="mt-1 min-h-24 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Pick an icon</span>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {choices.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "h-12 rounded-2xl border-2 text-2xl press-effect",
                  emoji === e ? "bg-primary-soft border-primary" : "bg-card border-border",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <label className="block mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Target (TON)</span>
          <input
            type="number"
            min={1}
            step="0.1"
            value={target}
            onChange={(e) => setTarget(Math.max(0.1, Number(e.target.value) || 0))}
            className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary tabular-nums"
          />
        </label>

        <div className="mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Visibility</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(["private", "public"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                className={cn(
                  "rounded-2xl border-2 py-2 font-display font-bold text-sm press-effect capitalize",
                  visibility === value ? "bg-primary-soft border-primary" : "bg-card border-border",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Strategy</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {([
              { value: "tonstakers", label: "TonStakers" },
              { value: "stonfi", label: "STON.fi LP" },
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStrategy(option.value)}
                className={cn(
                  "rounded-2xl border-2 py-2 font-display font-bold text-sm press-effect",
                  strategy === option.value ? "bg-primary-soft border-primary" : "bg-card border-border",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">End date (optional)</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 outline-none focus:border-primary"
          />
        </label>

        <PopButton
          block
          tone="primary"
          className="mt-5"
          disabled={!title.trim() || target < 0.1}
          onClick={() => void onCreate({ title: title.trim(), description: description.trim() || undefined, emoji, targetTon: target, visibility, strategy, dueDate: dueDate ? new Date(`${dueDate}T00:00:00`).toISOString() : undefined })}
        >
          Create goal
        </PopButton>
      </div>
    </div>
  );
};

const LeaderboardSection: React.FC<{
  rows: Array<{ rank: number; userId: string; username: string; xp: number; level: number }>;
  loading: boolean;
  userId: string;
}> = ({ rows, loading, userId }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="game-card divide-y divide-border">
      {rows.map((row) => (
        <div
          key={row.userId}
          className={cn("flex items-center gap-3 p-3", row.userId === userId && "bg-primary-soft")}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-display font-bold tabular-nums",
              row.rank === 1 && "bg-secondary-soft border-secondary text-secondary-foreground",
              row.rank === 2 && "bg-muted border-border",
              row.rank === 3 && "bg-warning/30 border-warning/60",
              row.rank > 3 && "bg-card border-border",
            )}
          >
            {row.rank <= 3 ? <Crown className="w-4 h-4" /> : `#${row.rank}`}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold truncate">{row.username}</p>
            <p className="text-xs text-muted-foreground">Lv {row.level}</p>
          </div>
          <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60 tabular-nums">
            {row.xp.toLocaleString()} XP
          </span>
        </div>
      ))}
    </div>
  );
};

const ActivitySection: React.FC<{ txs: Transaction[]; loading: boolean }> = ({ txs, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="game-card divide-y divide-border">
      {txs.length === 0 ? (
        <p className="p-6 text-sm text-muted-foreground text-center">No activity yet.</p>
      ) : (
        txs.map((t) => <TxRow key={t.id} t={t} />)
      )}
    </div>
  );
};

const TxRow: React.FC<{ t: Transaction }> = ({ t }) => {
  const Icon =
    t.type === "deposit"
      ? ArrowDownToLine
      : t.type === "withdraw"
      ? TrendingUp
      : Sparkles;

  const tone =
    t.type === "deposit"
      ? "bg-primary-soft text-primary-deep border-primary/40"
      : "bg-accent-soft text-accent-foreground border-accent/60";

  return (
    <div className="flex items-center gap-3 p-3">
      <div className={cn("w-10 h-10 rounded-2xl border-2 flex items-center justify-center", tone)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm truncate capitalize">{t.type}</p>
        <p className="text-xs text-muted-foreground truncate">{format(new Date(t.createdAt), "MMM d, HH:mm")}</p>
      </div>
      <div className="text-right">
        {t.amount && parseFloat(t.amount) > 0 && (
          <p className="font-display font-bold text-sm tabular-nums text-success-foreground">
            {t.amount} TON
          </p>
        )}
      </div>
    </div>
  );
};
