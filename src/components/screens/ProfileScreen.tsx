import * as React from "react";
import { PopButton } from "@/components/PopButton";
import { XPBar } from "@/components/XPBar";
import { ACTIVITIES, GOALS, LEADERBOARD, PROFILE, TOKENS, type Activity, type Goal } from "@/data/mock";
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
  Gift,
  UserPlus,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Section = "overview" | "assets" | "goals" | "leaderboard" | "activity";

export const ProfileScreen: React.FC = () => {
  const [section, setSection] = React.useState<Section>("overview");
  const [goals, setGoals] = React.useState<Goal[]>(GOALS);
  const [creatingGoal, setCreatingGoal] = React.useState(false);

  const portfolioUsd = TOKENS.reduce((s, t) => s + t.balance * t.priceUsd, 0);
  const xpPct = PROFILE.xp / PROFILE.xpNext;

  const addGoal = (g: Omit<Goal, "id" | "savedUsd">) => {
    setGoals((prev) => [
      { ...g, id: `g-${Date.now()}`, savedUsd: 0 },
      ...prev,
    ]);
    setCreatingGoal(false);
    toast.success("Goal added! Foxy will help you crush it 🎯");
  };

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
            <p className="font-display text-xl font-bold truncate">{PROFILE.name}</p>
            <p className="text-xs text-muted-foreground truncate">{PROFILE.handle} · {PROFILE.joinedLabel}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60">
                <Trophy className="w-3 h-3" /> Lv {PROFILE.level}
              </span>
              <span className="chip bg-warning/30 text-warning-foreground border border-warning/60">
                <Flame className="w-3 h-3" /> {PROFILE.streak}d
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="flex justify-between text-[11px] font-bold text-muted-foreground tabular-nums mb-1">
            <span>{PROFILE.xp} XP</span>
            <span>Next: {PROFILE.xpNext} XP</span>
          </div>
          <XPBar value={xpPct} tone="secondary" />
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Wealth" value={`$${portfolioUsd.toFixed(0)}`} />
          <Stat label="Saved" value={`$${PROFILE.totalSavedUsd}`} />
          <Stat label="Earned" value={`+$${PROFILE.totalEarnedUsd.toFixed(2)}`} />
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

      {section === "overview" && <OverviewSection goals={goals} />}
      {section === "assets" && <AssetsSection portfolioUsd={portfolioUsd} />}
      {section === "goals" && (
        <GoalsSection
          goals={goals}
          onAdd={() => setCreatingGoal(true)}
          onDeposit={(id, amt) => {
            setGoals((prev) =>
              prev.map((g) => (g.id === id ? { ...g, savedUsd: Math.min(g.targetUsd, g.savedUsd + amt) } : g)),
            );
            toast.success(`+$${amt} towards your goal 🎯`);
          }}
        />
      )}
      {section === "leaderboard" && <LeaderboardSection />}
      {section === "activity" && <ActivitySection />}

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

/* -------------------- Overview -------------------- */

const OverviewSection: React.FC<{ goals: Goal[] }> = ({ goals }) => {
  const top = goals[0];
  const recent = ACTIVITIES.slice(0, 3);
  const me = LEADERBOARD.find((r) => r.isMe);

  return (
    <div className="space-y-4">
      {top && (
        <article className="game-card p-4">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold inline-flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-deep" /> Top goal
            </p>
            <span className="text-xs text-muted-foreground">{top.dueLabel}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-2xl">{top.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold truncate">{top.title}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                ${top.savedUsd} of ${top.targetUsd}
              </p>
              <XPBar className="mt-1" value={top.savedUsd / top.targetUsd} tone="primary" />
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
            <p className="font-display font-bold">You're rank #{me.rank}</p>
            <p className="text-xs text-muted-foreground">Keep saving to climb the leaderboard!</p>
          </div>
          <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60 tabular-nums">
            {me.xp} XP
          </span>
        </article>
      )}

      <article>
        <p className="font-display font-bold mb-2 inline-flex items-center gap-2 px-1">
          <ActivityIcon className="w-4 h-4 text-accent-deep" /> Recent activity
        </p>
        <div className="game-card divide-y divide-border">
          {recent.map((a) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </div>
      </article>
    </div>
  );
};

/* -------------------- Assets -------------------- */

const AssetsSection: React.FC<{ portfolioUsd: number }> = ({ portfolioUsd }) => (
  <div className="space-y-3">
    <article className="game-card p-4">
      <p className="text-xs font-bold uppercase text-muted-foreground">Total balance</p>
      <p className="font-display text-3xl font-bold tabular-nums">
        ${portfolioUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </p>
    </article>
    <div className="game-card divide-y divide-border">
      {TOKENS.map((t) => {
        const valueUsd = t.balance * t.priceUsd;
        const up = t.change24h >= 0;
        return (
          <div key={t.symbol} className="flex items-center gap-3 p-3">
            <div className="w-11 h-11 rounded-2xl bg-muted border-2 border-border flex items-center justify-center text-xl shrink-0">
              {t.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm truncate">{t.name}</p>
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
      })}
    </div>
  </div>
);

/* -------------------- Goals -------------------- */

const GoalsSection: React.FC<{
  goals: Goal[];
  onAdd: () => void;
  onDeposit: (id: string, amount: number) => void;
}> = ({ goals, onAdd, onDeposit }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <p className="font-display font-bold inline-flex items-center gap-2">
        <Target className="w-4 h-4 text-primary-deep" /> Your goals
      </p>
      <PopButton size="sm" tone="primary" onClick={onAdd}>
        <Plus className="w-4 h-4" /> New goal
      </PopButton>
    </div>

    {goals.length === 0 ? (
      <div className="game-card p-6 text-center">
        <p className="font-display font-bold">No goals yet</p>
        <p className="text-sm text-muted-foreground">Set one and Foxy will cheer you on.</p>
      </div>
    ) : (
      goals.map((g) => {
        const pct = g.savedUsd / g.targetUsd;
        return (
          <article key={g.id} className="game-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-soft border-2 border-primary/40 flex items-center justify-center text-2xl shrink-0">
                {g.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-bold truncate">{g.title}</p>
                  <span className="text-xs text-muted-foreground">{g.dueLabel}</span>
                </div>
                <p className="text-xs text-muted-foreground tabular-nums">
                  ${g.savedUsd.toLocaleString()} of ${g.targetUsd.toLocaleString()} ({Math.round(pct * 100)}%)
                </p>
                <XPBar className="mt-2" value={pct} tone={g.tone === "secondary" ? "success" : g.tone} />
                <div className="flex gap-2 mt-3">
                  {[5, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => onDeposit(g.id, amt)}
                      className="flex-1 rounded-2xl border-2 border-border bg-card py-1.5 text-xs font-display font-bold press-effect"
                    >
                      +${amt}
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
  onCreate: (g: Omit<Goal, "id" | "savedUsd">) => void;
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = React.useState("");
  const [emoji, setEmoji] = React.useState("🎯");
  const [target, setTarget] = React.useState(500);
  const [due, setDue] = React.useState("Soon");
  const choices = ["🎯", "💻", "🗾", "🛟", "🏠", "🎓", "🚗", "💍"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create goal"
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="bg-card w-full max-w-md rounded-t-3xl border-t-2 border-x-2 border-border p-5 pb-8 animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <p className="font-display text-xl font-bold">New goal</p>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center press-effect">
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

        <div className="mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Pick an icon</span>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {choices.map((e) => (
              <button
                key={e}
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

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">Target ($)</span>
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 0))}
              className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary tabular-nums"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-muted-foreground">By when</span>
            <input
              value={due}
              onChange={(e) => setDue(e.target.value)}
              placeholder="Aug 2026"
              className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary"
            />
          </label>
        </div>

        <PopButton
          block
          tone="primary"
          className="mt-5"
          disabled={!title.trim() || target < 1}
          onClick={() => onCreate({ title: title.trim(), emoji, targetUsd: target, dueLabel: due || "Ongoing", tone: "primary" })}
        >
          Create goal
        </PopButton>
      </div>
    </div>
  );
};

/* -------------------- Leaderboard -------------------- */

const LeaderboardSection: React.FC = () => (
  <div className="game-card divide-y divide-border">
    {LEADERBOARD.map((row) => (
      <div
        key={row.rank}
        className={cn(
          "flex items-center gap-3 p-3",
          row.isMe && "bg-primary-soft",
        )}
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
          <p className="font-display font-bold truncate inline-flex items-center gap-2">
            <span className="text-lg">{row.emoji}</span> {row.name}
          </p>
          <p className="text-xs text-muted-foreground">Rank #{row.rank}</p>
        </div>
        <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60 tabular-nums">
          {row.xp.toLocaleString()} XP
        </span>
      </div>
    ))}
  </div>
);

/* -------------------- Activity -------------------- */

const ActivitySection: React.FC = () => (
  <div className="game-card divide-y divide-border">
    {ACTIVITIES.map((a) => (
      <ActivityRow key={a.id} a={a} />
    ))}
  </div>
);

const ActivityRow: React.FC<{ a: Activity }> = ({ a }) => {
  const Icon =
    a.kind === "deposit"
      ? ArrowDownToLine
      : a.kind === "reward"
      ? Gift
      : a.kind === "quest"
      ? Sparkles
      : a.kind === "join"
      ? UserPlus
      : TrendingUp;

  const tone =
    a.kind === "reward" || a.kind === "quest"
      ? "bg-secondary-soft text-secondary-foreground border-secondary/60"
      : a.kind === "deposit"
      ? "bg-primary-soft text-primary-deep border-primary/40"
      : "bg-accent-soft text-accent-foreground border-accent/60";

  return (
    <div className="flex items-center gap-3 p-3">
      <div className={cn("w-10 h-10 rounded-2xl border-2 flex items-center justify-center", tone)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm truncate">{a.title}</p>
        <p className="text-xs text-muted-foreground truncate">{a.subtitle}</p>
      </div>
      <div className="text-right">
        {a.amountUsd !== undefined && (
          <p className="font-display font-bold text-sm tabular-nums text-success-foreground">
            +${a.amountUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">{a.whenLabel}</p>
      </div>
    </div>
  );
};
