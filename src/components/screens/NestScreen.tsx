import * as React from "react";
import { PopButton } from "@/components/PopButton";
import {
  Home,
  Lock,
  Globe2,
  Users,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  Crown,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useConfirmJoinDen, useCreateDen, useDens, useMyDens, useJoinDen, useLeaveDen, useSyncDen, useUnwindDen, useUser } from "@/hooks/queries";
import { useWallet } from "@/hooks/useWallet";
import { queryClient } from "@/App";
import { queryKeys } from "@/lib/queryKeys";

type DisplayDen = {
  id: string;
  name: string;
  emoji: string | null;
  isPublic: boolean;
  strategy: string;
  apr: string;
  totalDeposited: string;
  vaultValueTon?: number;
  totalYieldTon?: number;
  memberCount: number;
  myDeposit?: number;
  myCurrentTon?: number;
  myYieldTon?: number;
  canWithdraw?: boolean;
  canUnwind?: boolean;
  tsTonBalance?: number;
  syncYieldTon?: number;
  isOwner?: boolean;
};

export const NestScreen: React.FC = () => {
  const [tab, setTab] = React.useState<"explore" | "mine">("explore");
  const [openDen, setOpenDen] = React.useState<DisplayDen | null>(null);
  const [creatingNest, setCreatingNest] = React.useState(false);
  const { connected, address, sendTransaction } = useWallet();
  const { data: user } = useUser();

  const { data: publicDens, isLoading: exploreLoading } = useDens();
  const { data: myDensData, isLoading: mineLoading } = useMyDens();
  const joinDen = useJoinDen();
  const confirmJoinDen = useConfirmJoinDen();
  const leaveDen = useLeaveDen();
  const syncDen = useSyncDen();
  const unwindDen = useUnwindDen();
  const createDen = useCreateDen();

  const isLoading = tab === "mine" ? mineLoading : exploreLoading;

  const dens: DisplayDen[] = React.useMemo(() => {
    const list = tab === "mine" ? (myDensData || []) : (publicDens || []);
    return list.map((d) => ({
      ...d,
      vaultValueTon: parseFloat(d.vaultValueTon || d.totalDeposited || "0"),
      totalYieldTon: parseFloat(d.totalYieldTon || "0"),
      myDeposit:
        tab === "mine" && d.myDepositTon != null
          ? parseFloat(d.myDepositTon)
          : 0,
      myCurrentTon:
        tab === "mine" && d.myCurrentTon != null
          ? parseFloat(d.myCurrentTon)
          : tab === "mine" && d.myDepositTon != null
            ? parseFloat(d.myDepositTon)
            : 0,
      myYieldTon:
        tab === "mine" && d.myYieldTon != null
          ? parseFloat(d.myYieldTon)
          : 0,
      canWithdraw: d.canWithdraw ?? false,
      canUnwind: d.canUnwind ?? false,
      tsTonBalance: parseFloat(d.tsTonBalance || "0"),
      syncYieldTon: parseFloat(d.syncYieldTon || "0"),
      isOwner: user?.id != null && d.ownerId === user.id,
    }));
  }, [publicDens, myDensData, tab, user?.id]);

  const invalidateNestQueries = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.dens });
    await queryClient.invalidateQueries({ queryKey: queryKeys.densMine });
    await queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
  }, []);

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

      await invalidateNestQueries();

      toast.success(`Deposited ${amountTon} TON 🦊`);
      setOpenDen(null);
    } catch (error) {
      toast.error("Failed to deposit.");
    }
  };

  const handleWithdraw = async (denId: string) => {
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

      await invalidateNestQueries();

      toast.success("Withdraw request sent");
      setOpenDen(null);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to withdraw.";
      toast.error(message);
    }
  };

  const handleCreateNest = async (data: {
    name: string;
    emoji: string;
    visibility: "public" | "private";
    strategy: "stake" | "pool";
    contractAddress?: string;
  }) => {
    if (!connected || !address) {
      toast.error("Connect your wallet first");
      return;
    }

    try {
      const result = await createDen.mutateAsync({
        name: data.name,
        emoji: data.emoji,
        isPublic: data.visibility === "public",
        strategy: data.strategy === "stake" ? "steady" : "adventurous",
        contractAddress: data.contractAddress?.trim() || undefined,
      });

      if (result.txParams.messages.length > 0) {
        await sendTransaction({
          validUntil: Date.now() + 5 * 60 * 1000,
          messages: result.txParams.messages,
        });
      }

      setCreatingNest(false);
      toast.success(result.txParams.messages.length > 0 ? "Nest created successfully" : "Nest imported successfully");
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to create Nest.";
      toast.error(message);
    }
  };

  const handleSync = async (denId: string) => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const result = await syncDen.mutateAsync(denId);
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.txParams.messages,
      });
      await invalidateNestQueries();
      toast.success(`Synced ${result.amount} TON of live yield`);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to sync yield.";
      toast.error(message);
    }
  };

  const handleUnwind = async (denId: string) => {
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const result = await unwindDen.mutateAsync({ denId, mode: "best-rate" });
      await sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: result.txParams.messages,
      });
      await invalidateNestQueries();
      toast.success(`Unstake started for ${result.amount} tsTON`);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || "Failed to start unstake.";
      toast.error(message);
    }
  };

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: queryKeys.dens });
    await queryClient.invalidateQueries({ queryKey: queryKeys.densMine });
    setLastUpdated(new Date());
    setIsRefreshing(false);
    toast.success("Refreshed");
  };

  return (
    <div className="px-4 pt-2 pb-28 animate-fade-in">
      <header className="mb-3 px-1 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Home className="w-6 h-6 text-primary-deep" />
          Nest Vaults
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-muted border border-border press-effect disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          {user?.isAdmin && (
            <PopButton size="sm" tone="primary" onClick={() => setCreatingNest(true)} disabled={!connected || createDen.isPending}>
              <Plus className="w-4 h-4" /> Create Nest
            </PopButton>
          )}
        </div>
      </header>
      {lastUpdated && (
        <p className="text-xs text-muted-foreground px-1 -mt-3 mb-2">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}

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
          onWithdraw={() => handleWithdraw(openDen.id)}
          onSync={() => handleSync(openDen.id)}
          onUnwind={() => handleUnwind(openDen.id)}
          isDepositing={joinDen.isPending || confirmJoinDen.isPending}
          isWithdrawing={leaveDen.isPending}
          isSyncing={syncDen.isPending}
          isUnwinding={unwindDen.isPending}
        />
      )}

      {creatingNest && user?.isAdmin ? (
        <CreateNestSheet
          onClose={() => setCreatingNest(false)}
          onCreate={handleCreateNest}
          isCreating={createDen.isPending}
        />
      ) : null}
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
              {Number(den.vaultValueTon ?? parseFloat(den.totalDeposited)).toLocaleString()} TON
            </span>
          </div>

          {(den.totalYieldTon || 0) > 0 && (
            <div className="mt-2 chip bg-success/20 text-success-foreground border border-success/30">
              <TrendingUp className="w-3 h-3" /> Vault yield +{den.totalYieldTon?.toFixed(2)} TON
            </div>
          )}

          {den.myDeposit && den.myDeposit > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="chip bg-primary-soft text-primary-deep border border-primary/40">
                <Sparkles className="w-3 h-3" /> You: {den.myCurrentTon?.toLocaleString() ?? den.myDeposit.toLocaleString()} TON
              </div>
              {(den.myYieldTon || 0) !== 0 && (
                <div className="chip bg-success/20 text-success-foreground border border-success/30">
                  <TrendingUp className="w-3 h-3" /> Yield {den.myYieldTon && den.myYieldTon > 0 ? "+" : ""}{den.myYieldTon?.toFixed(2)} TON
                </div>
              )}
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
  onWithdraw: () => void;
  onSync: () => void;
  onUnwind: () => void;
  isDepositing?: boolean;
  isWithdrawing?: boolean;
  isSyncing?: boolean;
  isUnwinding?: boolean;
}> = ({ den, onClose, onDeposit, onWithdraw, onSync, onUnwind, isDepositing, isWithdrawing, isSyncing, isUnwinding }) => {
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
            <p className="font-display font-bold tabular-nums">{(den.vaultValueTon ?? parseFloat(den.totalDeposited)).toFixed(2)} TON</p>
          </div>
        </div>

        {den.myDeposit && den.myDeposit > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted rounded-2xl p-2 border border-border">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Principal</p>
              <p className="font-display font-bold tabular-nums">{den.myDeposit.toFixed(2)} TON</p>
            </div>
            <div className="bg-muted rounded-2xl p-2 border border-border">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Value</p>
              <p className="font-display font-bold tabular-nums">{(den.myCurrentTon ?? den.myDeposit).toFixed(2)} TON</p>
            </div>
            <div className="bg-muted rounded-2xl p-2 border border-border">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Yield</p>
              <p className="font-display font-bold tabular-nums text-success-foreground">{den.myYieldTon && den.myYieldTon > 0 ? "+" : ""}{(den.myYieldTon ?? 0).toFixed(2)} TON</p>
            </div>
          </div>
        ) : null}

        {den.isOwner && den.strategy === "steady" ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="bg-muted rounded-2xl p-2 border border-border text-left press-effect disabled:opacity-50" onClick={onSync} disabled={isSyncing || (den.syncYieldTon ?? 0) <= 0}>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Sync yield</p>
              <p className="font-display font-bold tabular-nums">{(den.syncYieldTon ?? 0) > 0 ? `+${(den.syncYieldTon ?? 0).toFixed(2)} TON` : "Up to date"}</p>
            </button>
            <button className="bg-muted rounded-2xl p-2 border border-border text-left press-effect disabled:opacity-50" onClick={onUnwind} disabled={isUnwinding || !den.canUnwind}>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Unstake tsTON</p>
              <p className="font-display font-bold tabular-nums">{(den.tsTonBalance ?? 0) > 0 ? `${(den.tsTonBalance ?? 0).toFixed(2)} tsTON` : "Nothing staked"}</p>
            </button>
          </div>
        ) : null}

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
                  {p}
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
          {den.canWithdraw ? (
            <button
              className="w-full mt-2 bg-card text-foreground rounded-2xl py-3 font-display font-bold border-2 border-border press-effect disabled:opacity-50"
              onClick={onWithdraw}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `Withdraw ${(den.myCurrentTon ?? den.myDeposit ?? 0).toFixed(2)} TON`}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const CreateNestSheet: React.FC<{
  onClose: () => void;
  onCreate: (data: { name: string; emoji: string; visibility: "public" | "private"; strategy: "stake" | "pool"; contractAddress?: string }) => void;
  isCreating?: boolean;
}> = ({ onClose, onCreate, isCreating }) => {
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState("🏠");
  const [visibility, setVisibility] = React.useState<"public" | "private">("public");
  const [strategy, setStrategy] = React.useState<"stake" | "pool">("stake");
  const [contractAddress, setContractAddress] = React.useState("");

  const emojiChoices = ["🏠", "🦊", "🪙", "💎", "🌊", "🛟", "🚀", "🎯", "🌱", "🏝️"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create a new nest"
      className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-md rounded-t-3xl border-t-2 border-x-2 border-border p-5 pb-8 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <p className="font-display text-xl font-bold">Create Nest</p>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center press-effect">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block">
          <span className="text-xs font-bold uppercase text-muted-foreground">Nest name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kitsu Core Vault"
            className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary"
          />
        </label>

        <div className="mt-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Pick an icon</span>
          <div className="grid grid-cols-5 gap-2 mt-1">
            {emojiChoices.map((choice) => (
              <button
                key={choice}
                onClick={() => setEmoji(choice)}
                className={cn(
                  "h-12 rounded-2xl border-2 text-2xl press-effect",
                  emoji === choice ? "bg-primary-soft border-primary" : "bg-card border-border",
                )}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Who can join?</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(["private", "public"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setVisibility(value)}
                className={cn(
                  "rounded-2xl border-2 p-3 text-left press-effect",
                  visibility === value ? "bg-primary-soft border-primary" : "bg-card border-border",
                )}
              >
                <p className="font-display font-bold inline-flex items-center gap-1.5 text-sm">
                  {value === "public" ? <Globe2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {value === "public" ? "Public" : "Private"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Strategy</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setStrategy("stake")}
              className={cn(
                "rounded-2xl border-2 p-3 text-left press-effect",
                strategy === "stake" ? "bg-accent-soft border-accent" : "bg-card border-border",
              )}
            >
              <p className="font-display font-bold text-sm">🛟 TonStakers</p>
              <p className="text-[11px] text-muted-foreground">Steady strategy</p>
            </button>
            <button
              onClick={() => setStrategy("pool")}
              className={cn(
                "rounded-2xl border-2 p-3 text-left press-effect",
                strategy === "pool" ? "bg-secondary-soft border-secondary" : "bg-card border-border",
              )}
            >
              <p className="font-display font-bold text-sm">🚀 STON.fi</p>
              <p className="text-[11px] text-muted-foreground">Pool strategy</p>
            </button>
          </div>
        </div>

        <label className="block mt-4">
          <span className="text-xs font-bold uppercase text-muted-foreground">Existing contract address (optional)</span>
          <input
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="Paste deployed NestVault address to import"
            className="mt-1 w-full bg-muted rounded-2xl border-2 border-border px-3 py-2.5 font-display font-bold outline-none focus:border-primary"
          />
        </label>

        <PopButton
          block
          tone="primary"
          className="mt-5"
          disabled={!name.trim() || isCreating}
          onClick={() => onCreate({ name: name.trim(), emoji, visibility, strategy, contractAddress })}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating...
            </>
          ) : (
            "Create Nest"
          )}
        </PopButton>
      </div>
    </div>
  );
};
