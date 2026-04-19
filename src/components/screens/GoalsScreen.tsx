import * as React from "react";
import { PopButton } from "@/components/PopButton";
import {
  Target,
  Lock,
  Globe2,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGoals, useCreateGoal, useDepositGoal, useClaimGoal, useUser } from "@/hooks/queries";
import { useWallet } from "@/hooks/useWallet";
import type { Goal } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export const GoalsScreen: React.FC = () => {
  const [creating, setCreating] = React.useState(false);
  const [openGoal, setOpenGoal] = React.useState<Goal | null>(null);
  const { connected, address, sendTransaction } = useWallet();
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const depositGoal = useDepositGoal();
  const claimGoal = useClaimGoal();

  const handleCreate = async (data: {
    title: string;
    emoji: string;
    targetTon: number;
    visibility: "private" | "public";
    strategy: "tonstakers" | "stonfi";
  }) => {
    if (!connected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      const result = await createGoal.mutateAsync({
        title: data.title,
        emoji: data.emoji || "🎯",
        targetTon: data.targetTon.toFixed(8),
        visibility: data.visibility,
        strategy: data.strategy,
      });
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.txParams.messages,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      await queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
      setCreating(false);
      toast.success("Goal created! Let's crush it 🎯");
    } catch (error) {
      toast.error("Failed to create goal. Try again.");
    }
  };

  const handleDepositGoal = async (goalId: string, amountTon: number) => {
    if (!connected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      const result = await depositGoal.mutateAsync({
        id: goalId,
        amountTon: amountTon.toFixed(8),
      });
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.txParams.messages,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      await queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
      toast.success(`Deposited ${amountTon} TON`);
      setOpenGoal(null);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to deposit.";
      toast.error(message);
    }
  };

  const handleClaimGoal = async (goalId: string) => {
    if (!connected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      const result = await claimGoal.mutateAsync(goalId);
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.txParams.messages,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      await queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
      toast.success("Claim request sent");
      setOpenGoal(null);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to claim goal.";
      toast.error(message);
    }
  };

  return (
    <div className="px-4 pt-2 pb-28 animate-fade-in">
      <header className="flex items-center justify-between mb-3 px-1">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-deep" />
          My Goals
        </h1>
        <PopButton size="sm" tone="primary" onClick={() => setCreating(true)} disabled={!connected}>
          <Plus className="w-4 h-4" /> New
        </PopButton>
      </header>

      <p className="text-sm text-muted-foreground px-1 mb-4">
        Set savings goals and watch your TON grow. Funds forward to validators for yield.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <div className="game-card p-6 text-center">
          <p className="font-display font-bold text-lg">No goals yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first savings goal and start growing your TON!
          </p>
          <PopButton tone="primary" size="sm" className="mt-3" onClick={() => setCreating(true)} disabled={!connected}>
            <Plus className="w-4 h-4" /> Create Goal
          </PopButton>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onOpen={() => setOpenGoal(goal)} />
          ))}
        </div>
      )}

      {creating && (
        <CreateGoalSheet
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
          isCreating={createGoal.isPending}
        />
      )}

      {openGoal && (
        <GoalSheet
          goal={openGoal}
          onClose={() => setOpenGoal(null)}
          onDeposit={(amount) => handleDepositGoal(openGoal.id, amount)}
          onClaim={() => handleClaimGoal(openGoal.id)}
          isDepositing={depositGoal.isPending}
          isClaiming={claimGoal.isPending}
        />
      )}
    </div>
  );
};

const GoalCard: React.FC<{ goal: Goal; onOpen: () => void }> = ({ goal, onOpen }) => {
  const current = parseFloat(goal.currentTon || "0");
  const target = parseFloat(goal.targetTon || "1");
  const yieldTon = parseFloat(goal.yieldTon || "0");
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <button onClick={onOpen} className="game-card p-4 w-full text-left press-effect">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl shrink-0 bg-muted border-border">
          {goal.emoji || "🎯"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold truncate">{goal.title}</p>
            <span
              className={cn(
                "chip border",
                goal.visibility === "public"
                  ? "bg-accent-soft text-accent-foreground border-accent/60"
                  : "bg-muted text-foreground border-border",
              )}
            >
              {goal.visibility === "public" ? <Globe2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {goal.visibility}
            </span>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground font-bold">
                {current.toFixed(2)} / {target.toFixed(2)} TON
              </span>
              <span className="text-success-foreground font-bold">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground font-bold">
              <TrendingUp className="w-3 h-3" /> {goal.strategy === "stonfi" ? "DEX" : "Staking"}
            </span>
            {yieldTon !== 0 && (
              <span className="inline-flex items-center gap-1 text-success-foreground font-bold">
                <Sparkles className="w-3 h-3" /> Yield {yieldTon > 0 ? "+" : ""}{yieldTon.toFixed(2)} TON
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

const GoalSheet: React.FC<{
  goal: Goal;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  onClaim: () => void;
  isDepositing?: boolean;
  isClaiming?: boolean;
}> = ({ goal, onClose, onDeposit, onClaim, isDepositing, isClaiming }) => {
  const [amount, setAmount] = React.useState(10);
  const presets = [5, 10, 25, 50];
  const current = parseFloat(goal.currentTon || "0");
  const target = parseFloat(goal.targetTon || "0");
  const principal = parseFloat(goal.principalTon || goal.currentTon || "0");
  const yieldTon = parseFloat(goal.yieldTon || "0");

  return (
    <div role="dialog" aria-modal="true" aria-label={`${goal.title} details`} className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-3xl border-t-2 border-x-2 border-border p-5 pb-8 animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shrink-0 bg-muted border-border">{goal.emoji || "🎯"}</div>
            <div>
              <p className="font-display text-xl font-bold">{goal.title}</p>
              <p className="text-xs text-muted-foreground">{goal.visibility} · {goal.strategy === "stonfi" ? "STON.fi" : "TonStakers"}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center press-effect">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Progress</p>
            <p className="font-display font-bold tabular-nums">{current.toFixed(2)} / {target.toFixed(2)} TON</p>
          </div>
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Strategy</p>
            <p className="font-display font-bold">{goal.strategy === "stonfi" ? "STON.fi" : "TonStakers"}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Principal</p>
            <p className="font-display font-bold tabular-nums">{principal.toFixed(2)} TON</p>
          </div>
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Value</p>
            <p className="font-display font-bold tabular-nums">{current.toFixed(2)} TON</p>
          </div>
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Yield</p>
            <p className="font-display font-bold tabular-nums text-success-foreground">{yieldTon > 0 ? "+" : ""}{yieldTon.toFixed(2)} TON</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-display font-bold mb-2">Deposit TON</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {presets.map((p) => (
              <button key={p} onClick={() => setAmount(p)} className={cn("rounded-2xl border-2 py-2 font-display font-bold text-sm press-effect", amount === p ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-2xl border-2 border-border px-3 py-2">
            <span className="font-display font-bold">TON</span>
            <input type="number" min={0.1} value={amount} onChange={(e) => setAmount(Math.max(0.1, Number(e.target.value) || 0))} className="flex-1 bg-transparent outline-none font-display font-bold text-lg tabular-nums" />
          </div>
          <button className="w-full mt-4 bg-primary text-primary-foreground rounded-2xl py-3 font-display font-bold press-effect disabled:opacity-50" onClick={() => onDeposit(amount)} disabled={isDepositing}>
            {isDepositing ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `Deposit ${amount} TON`}
          </button>
          <button className="w-full mt-2 bg-card text-foreground rounded-2xl py-3 font-display font-bold border-2 border-border press-effect disabled:opacity-50" onClick={onClaim} disabled={isClaiming || goal.canClaim === false}>
            {isClaiming ? <Loader2 className="w-4 h-4 animate-spin inline" /> : goal.canClaim === false ? "Waiting for strategy unwind" : "Claim / Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateGoalSheet: React.FC<{
  onClose: () => void;
  onCreate: (data: {
    title: string;
    emoji: string;
    targetTon: number;
    visibility: "private" | "public";
    strategy: "tonstakers" | "stonfi";
  }) => void;
  isCreating?: boolean;
}> = ({ onClose, onCreate, isCreating }) => {
  const [title, setTitle] = React.useState("");
  const [emoji, setEmoji] = React.useState("🎯");
  const [targetTon, setTargetTon] = React.useState(100);
  const [visibility, setVisibility] = React.useState<"private" | "public">("private");
  const [strategy, setStrategy] = React.useState<"tonstakers" | "stonfi">("tonstakers");

  const emojiChoices = ["🎯", "🏖️", "🚗", "💻", "📱", "🏠", "💍", "🛟", "🎮", "🎓"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a new goal"
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-t-3xl border-t-2 border-x-2 border-border p-5 pb-8 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <p className="font-display text-xl font-bold">New Savings Goal</p>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center press-effect">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">Goal name</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New Laptop"
            className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary"
          />
        </label>

        <div className="mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Pick an icon</span>
          <div className="grid grid-cols-5 gap-2 mt-1">
            {emojiChoices.map((e) => (
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

        <label className="block mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Target (TON)</span>
          <input
            type="number"
            value={targetTon}
            onChange={(e) => setTargetTon(Math.max(1, Number(e.target.value) || 0))}
            className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary"
          />
        </label>

        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Who can see?</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(["private", "public"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={cn(
                  "rounded-2xl border-2 p-3 text-left press-effect",
                  visibility === v ? "bg-primary-soft border-primary" : "bg-card border-border",
                )}
              >
                <p className="font-display font-bold inline-flex items-center gap-1.5 text-sm">
                  {v === "public" ? <Globe2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {v === "public" ? "Public" : "Private"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Strategy</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setStrategy("tonstakers")}
              className={cn(
                "rounded-2xl border-2 p-3 text-left press-effect",
                strategy === "tonstakers" ? "bg-accent-soft border-accent" : "bg-card border-border",
              )}
            >
              <p className="font-display font-bold text-sm">🛟 TonStakers</p>
              <p className="text-[11px] text-muted-foreground">Safe staking · ~5% / yr</p>
            </button>
            <button
              onClick={() => setStrategy("stonfi")}
              className={cn(
                "rounded-2xl border-2 p-3 text-left press-effect",
                strategy === "stonfi" ? "bg-secondary-soft border-secondary" : "bg-card border-border",
              )}
            >
              <p className="font-display font-bold text-sm">🚀 STON.fi</p>
              <p className="text-[11px] text-muted-foreground">DEX pool · ~8% / yr</p>
            </button>
          </div>
        </div>

        <PopButton
          block
          tone="primary"
          className="mt-5"
          disabled={!title.trim() || targetTon < 1 || isCreating}
          onClick={() => onCreate({ title: title.trim(), emoji, targetTon, visibility, strategy })}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating...
            </>
          ) : (
            `Create Goal (${targetTon} TON)`
          )}
        </PopButton>
      </div>
    </div>
  );
};
