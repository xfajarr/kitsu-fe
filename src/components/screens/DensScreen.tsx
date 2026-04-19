import * as React from "react";
import { PopButton } from "@/components/PopButton";
import { XPBar } from "@/components/XPBar";
import {
  Vault,
  Lock,
  Globe2,
  Users,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  Crown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useConfirmJoinDen, useDens, useMyDens, useJoinDen, useLeaveDen, useUser } from "@/hooks/queries";
import { useWallet } from "@/hooks/useWallet";
import type { Den } from "@/lib/api";

type Tab = "explore" | "mine";

type DisplayDen = {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  strategy: string;
  apr: string;
  totalDeposited: string;
  memberCount: number;
  myDeposit?: number;
  isOwner?: boolean;
};

export const DensScreen: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>("explore");
  const [openDen, setOpenDen] = React.useState<DisplayDen | null>(null);
  const { connected, address, sendTransaction } = useWallet();
  const { data: user } = useUser();

  const { data: publicDens, isLoading: exploreLoading } = useDens();
  const { data: myDensData, isLoading: mineLoading } = useMyDens();
  const joinDen = useJoinDen();
  const confirmJoinDen = useConfirmJoinDen();
  const leaveDen = useLeaveDen();

  const isLoading = tab === "mine" ? mineLoading : exploreLoading;

  // Transform API data to display format
  const dens: DisplayDen[] = React.useMemo(() => {
    const list = tab === "mine" ? (myDensData || []) : (publicDens || []);
    return list.map((d) => ({
      ...d,
      myDeposit:
        tab === "mine" && d.myDepositTon != null
          ? parseFloat(d.myDepositTon)
          : 0,
      isOwner: user?.id != null && d.ownerId === user.id,
    }));
  }, [publicDens, myDensData, tab, user?.id]);

  const handleDeposit = async (denId: string, amountTon: number) => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const result = await joinDen.mutateAsync({
        denId,
        amountTon: amountTon.toFixed(8),
      });
      const txResult = await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.deposit.txParams.messages,
      });

      if (!txResult?.boc) {
        throw new Error("Missing wallet transaction BOC");
      }

      await confirmJoinDen.mutateAsync({
        denId,
        confirmationToken: result.deposit.confirmationToken,
        txBoc: txResult.boc,
      });

      toast.success(`Deposited ${amountTon} TON into your den 🦊`, {
        description: "Foxy will start growing it for you.",
      });
      setOpenDen(null);
    } catch (error) {
      toast.error("Failed to deposit. Please try again.");
    }
  };

  const handleLeave = async (denId: string) => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const result = await leaveDen.mutateAsync(denId);
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.txParams.messages,
      });
      toast.success("Withdrawn from den");
      setOpenDen(null);
    } catch (error) {
      toast.error("Failed to withdraw. Please try again.");
    }
  };

  

  return (
    <div className="px-4 pt-2 pb-28 animate-fade-in">
      <header className="flex items-center justify-between mb-3 px-1">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Vault className="w-6 h-6 text-primary-deep" />
          Money Dens
        </h1>
        
      </header>

      <p className="text-sm text-muted-foreground px-1 mb-4">
        Cozy savings spots that grow your TON automatically. Join a public one or make your own.
      </p>

      {/* Tabs */}
      <div className="bg-muted rounded-2xl p-1 flex mb-4 border-2 border-border">
        {(["explore", "mine"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-xl font-display font-bold text-sm capitalize transition-colors press-effect",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {t === "explore" ? "Explore" : "My Dens"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : dens.length === 0 ? (
        <div className="game-card p-6 text-center">
          <p className="font-display font-bold text-lg">No {tab === "mine" ? "joined nests" : "public nests"} yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "mine" 
              ? "You're not in any nest yet. Explore public ones to join!"
              : "No public nests available. Check back later."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dens.map((d) => (
            <DenCard key={d.id} den={d} onOpen={() => setOpenDen(d)} />
          ))}
        </div>
      )}

      {openDen && (
        <DenSheet
          den={openDen}
          onClose={() => setOpenDen(null)}
          onDeposit={(amount) => handleDeposit(openDen.id, amount)}
          onLeave={() => handleLeave(openDen.id)}
          isDepositing={joinDen.isPending || confirmJoinDen.isPending}
          isLeaving={leaveDen.isPending}
        />
      )}
    </div>
  );
};

const toneSoft = {
  steady: "bg-primary-soft border-primary/40",
  adventurous: "bg-secondary-soft border-secondary/60",
} as const;

const DenCard: React.FC<{ den: DisplayDen; onOpen: () => void }> = ({ den, onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left game-card p-4 press-effect"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shrink-0 bg-muted border-border",
          )}
        >
          {den.emoji || "🦊"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold truncate">{den.name}</p>
            {den.isOwner && (
              <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60">
                <Crown className="w-3 h-3" /> Owner
              </span>
            )}
            <span
              className={cn(
                "chip border",
                den.isPublic
                  ? "bg-accent-soft text-accent-foreground border-accent/60"
                  : "bg-muted text-foreground border-border",
              )}
            >
              {den.isPublic ? <Globe2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {den.isPublic ? "public" : "private"}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 text-success-foreground font-bold">
              <TrendingUp className="w-3 h-3" /> ~{den.apr}% / yr
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground font-bold">
              <Users className="w-3 h-3" /> {den.memberCount.toLocaleString()}
            </span>
            <span className="text-muted-foreground font-bold tabular-nums">
              {parseFloat(den.totalDeposited).toLocaleString()} TON saved
            </span>
          </div>

          {den.myDeposit && den.myDeposit > 0 && (
            <div className="mt-2 chip bg-primary-soft text-primary-deep border border-primary/40">
              <Sparkles className="w-3 h-3" /> You: {den.myDeposit.toLocaleString()} TON
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

const DenSheet: React.FC<{
  den: DisplayDen;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  onLeave: () => void;
  isDepositing?: boolean;
  isLeaving?: boolean;
}> = ({ den, onClose, onDeposit, onLeave, isDepositing, isLeaving }) => {
  const [amount, setAmount] = React.useState(25);
  const presets = [1, 5, 10, 25];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${den.name} details`}
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-t-3xl border-t-2 border-x-2 border-border p-5 pb-8 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl bg-muted border-border")}>
              {den.emoji || "🦊"}
            </div>
            <div>
              <p className="font-display text-xl font-bold">{den.name}</p>
              <p className="text-xs text-muted-foreground">
                {den.strategy === "steady" ? "Steady Strategy" : "Adventurous Strategy"}
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center press-effect"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Reward</p>
            <p className="font-display font-bold text-success-foreground">~{den.apr}%</p>
          </div>
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Savers</p>
            <p className="font-display font-bold tabular-nums">{den.memberCount.toLocaleString()}</p>
          </div>
          <div className="bg-muted rounded-2xl p-2 border border-border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">In den</p>
            <p className="font-display font-bold tabular-nums">{parseFloat(den.totalDeposited).toFixed(2)} TON</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-display font-bold mb-2">Add to your savings</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p)}
                className={cn(
                  "rounded-2xl border-2 py-2 font-display font-bold text-sm press-effect",
                  amount === p ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border",
                )}
              >
                {p} TON
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-2xl border-2 border-border px-3 py-2">
            <span className="font-display font-bold">TON</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
              className="flex-1 bg-transparent outline-none font-display font-bold text-lg tabular-nums"
              aria-label="Custom amount"
            />
          </div>
          <PopButton 
            block 
            tone="primary" 
            className="mt-4" 
            onClick={() => onDeposit(amount)}
            disabled={isDepositing}
          >
            {isDepositing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Depositing...
              </>
            ) : (
              `Save ${amount} TON into this Den`
            )}
          </PopButton>
          
          {den.myDeposit !== undefined && den.myDeposit > 0 && (
            <button 
              className="w-full mt-2 bg-card text-foreground rounded-2xl py-3 font-display font-bold border-2 border-border press-effect disabled:opacity-50" 
              onClick={onLeave}
              disabled={isLeaving}
            >
              {isLeaving ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                `Withdraw ${den.myDeposit.toFixed(2)} TON`
              )}
            </button>
          )}
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Foxy keeps your funds growing safely on the TON network.
          </p>
        </div>
      </div>
    </div>
  );
};

const CreateDenSheet: React.FC<{
  onClose: () => void;
  onCreate: (data: { name: string; emoji: string; visibility: "public" | "private"; strategy: "stake" | "pool" }) => void;
  isCreating?: boolean;
}> = ({ onClose, onCreate, isCreating }) => {
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState("🦊");
  const [visibility, setVisibility] = React.useState<"public" | "private">("private");
  const [strategy, setStrategy] = React.useState<"stake" | "pool">("stake");

  const emojiChoices = ["🦊", "🪙", "💎", "🌸", "🍕", "🛟", "🗾", "☕", "🎮", "🏠"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a new den"
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-t-3xl border-t-2 border-x-2 border-border p-5 pb-8 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <p className="font-display text-xl font-bold">Create a Money Den</p>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center press-effect">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tokyo Trip Fund"
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

        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Who can join?</span>
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
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {v === "public" ? "Anyone can join & save" : "Only people you invite"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Saving style</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setStrategy("stake")}
              className={cn(
                "rounded-2xl border-2 p-3 text-left press-effect",
                strategy === "stake" ? "bg-accent-soft border-accent" : "bg-card border-border",
              )}
            >
              <p className="font-display font-bold text-sm">🛟 Steady</p>
              <p className="text-[11px] text-muted-foreground">Slow & safe · ~4.8% / yr</p>
            </button>
            <button
              onClick={() => setStrategy("pool")}
              className={cn(
                "rounded-2xl border-2 p-3 text-left press-effect",
                strategy === "pool" ? "bg-secondary-soft border-secondary" : "bg-card border-border",
              )}
            >
              <p className="font-display font-bold text-sm">🚀 Adventurous</p>
              <p className="text-[11px] text-muted-foreground">More reward · ~16% / yr</p>
            </button>
          </div>
        </div>

        <PopButton
          block
          tone="primary"
          className="mt-5"
          disabled={!name.trim() || isCreating}
          onClick={() => onCreate({ name: name.trim(), emoji, visibility, strategy })}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating...
            </>
          ) : (
            "Create Den"
          )}
        </PopButton>
      </div>
    </div>
  );
};
