import * as React from "react";
import {
  Home,
  Lock,
  Globe2,
  Users,
  X,
  Sparkles,
  TrendingUp,
  Crown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDens, useMyDens, useJoinDen, useUser } from "@/hooks/queries";
import { useWallet } from "@/hooks/useWallet";

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

export const NestScreen: React.FC = () => {
  const [tab, setTab] = React.useState<"explore" | "mine">("explore");
  const [openDen, setOpenDen] = React.useState<DisplayDen | null>(null);
  const { connected, address, sendTransaction } = useWallet();
  const { data: user } = useUser();

  const { data: publicDens, isLoading: exploreLoading } = useDens();
  const { data: myDensData, isLoading: mineLoading } = useMyDens();
  const joinDen = useJoinDen();

  const isLoading = tab === "mine" ? mineLoading : exploreLoading;

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
        amountTon: amountTon.toString(),
      });
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.deposit.txParams.messages,
      });
      toast.success(`Deposited ${amountTon} TON 🦊`);
      setOpenDen(null);
    } catch (error) {
      toast.error("Failed to deposit.");
    }
  };

  return (
    <div className="px-4 pt-2 pb-28 animate-fade-in">
      <header className="mb-3 px-1">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Home className="w-6 h-6 text-primary-deep" />
          Nest Vaults
        </h1>
      </header>

      <p className="text-sm text-muted-foreground px-1 mb-4">
        Public vaults anyone can deposit into. Join a nest and grow together.
      </p>

      <div className="bg-muted rounded-2xl p-1 flex mb-4 border-2 border-border">
        {(["explore", "mine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-xl font-display font-bold text-sm capitalize transition-colors press-effect",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            {t === "explore" ? "Explore" : "My Nest"}
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
              ? "You're not in any nest yet. Explore to join!"
              : "No public nests available."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dens.map((d) => (
            <NestCard key={d.id} den={d} onOpen={() => setOpenDen(d)} />
          ))}
        </div>
      )}

      {openDen && (
        <NestSheet
          den={openDen}
          onClose={() => setOpenDen(null)}
          onDeposit={(amount) => handleDeposit(openDen.id, amount)}
          isDepositing={joinDen.isPending}
        />
      )}
    </div>
  );
};

const NestCard: React.FC<{ den: DisplayDen; onOpen: () => void }> = ({ den, onOpen }) => {
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
          {den.emoji || "🏠"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display font-bold truncate">{den.name}</p>
            {den.isOwner && (
              <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60">
                <Crown className="w-3 h-3" /> Owner
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 text-success-foreground font-bold">
              <TrendingUp className="w-3 h-3" /> ~{den.apr}% / yr
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground font-bold">
              <Users className="w-3 h-3" /> {den.memberCount.toLocaleString()}
            </span>
            <span className="text-muted-foreground font-bold tabular-nums">
              {parseFloat(den.totalDeposited).toLocaleString()} TON
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

const NestSheet: React.FC<{
  den: DisplayDen;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  isDepositing?: boolean;
}> = ({ den, onClose, onDeposit, isDepositing }) => {
  const [amount, setAmount] = React.useState(25);
  const presets = [10, 25, 50, 100];

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
              {den.emoji || "🏠"}
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
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total</p>
            <p className="font-display font-bold tabular-nums">{parseFloat(den.totalDeposited).toFixed(2)} TON</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-display font-bold mb-2">Deposit TON</p>
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
                ${p}
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
            />
          </div>
          <button
            className="w-full mt-4 bg-primary text-primary-foreground rounded-2xl py-3 font-display font-bold press-effect disabled:opacity-50"
            onClick={() => onDeposit(amount)}
            disabled={isDepositing}
          >
            {isDepositing ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `Save ${amount} TON`}
          </button>
        </div>
      </div>
    </div>
  );
};