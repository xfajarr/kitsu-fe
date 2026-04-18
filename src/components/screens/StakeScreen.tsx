import * as React from "react";
import { PopButton } from "@/components/PopButton";
import { FoxBuddy } from "@/components/FoxBuddy";
import { STAKING, TOKENS } from "@/data/mock";
import { Sprout, Gift, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import tonCoin from "@/assets/ton-coin.png";

export const StakeScreen: React.FC = () => {
  const ton = TOKENS[0];
  const [amount, setAmount] = React.useState("10");
  const [busy, setBusy] = React.useState<"stake" | "claim" | null>(null);

  const yearly = (parseFloat(amount || "0") * STAKING.apr) / 100;

  const handleStake = async () => {
    setBusy("stake");
    await new Promise((r) => setTimeout(r, 800));
    setBusy(null);
    toast.success(`Staked ${amount} TON`, {
      description: `Earning ~${STAKING.apr}% APR with TONStakers`,
    });
  };
  const handleClaim = async () => {
    setBusy("claim");
    await new Promise((r) => setTimeout(r, 700));
    setBusy(null);
    toast.success(`Claimed ${STAKING.rewards} TON rewards 🦊`);
  };

  return (
    <div className="px-4 pt-2 pb-28 space-y-5 animate-fade-in">
      <div className="px-1">
        <h1 className="font-display text-2xl font-bold">Grow your TON</h1>
        <p className="text-xs text-muted-foreground">Powered by TONStakers · withdraw anytime</p>
      </div>

      {/* Hero stake card */}
      <section className="game-card p-5 relative overflow-hidden">
        <div aria-hidden className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent-soft" />
        <div className="relative flex items-center gap-3">
          <img src={tonCoin} alt="" width={64} height={64} className="w-14 h-14 animate-float" loading="lazy" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total staked</p>
            <p className="font-display text-3xl font-bold tabular-nums">{STAKING.staked} TON</p>
            <p className="text-xs text-muted-foreground">≈ ${(STAKING.staked * ton.priceUsd).toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "APR", value: `${STAKING.apr}%`, tone: "bg-success/25 text-success-foreground" },
            { label: "TVL", value: STAKING.tvl, tone: "bg-accent-soft text-accent-foreground" },
            { label: "Lock", value: "None", tone: "bg-secondary-soft text-secondary-foreground" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border-2 border-border ${s.tone} py-2`}>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{s.label}</p>
              <p className="font-display font-bold text-sm">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pending rewards */}
      <section className="game-card p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-secondary-soft border-2 border-secondary/60 flex items-center justify-center">
          <Gift className="w-6 h-6 text-secondary-deep" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-muted-foreground">Pending rewards</p>
          <p className="font-display text-xl font-bold tabular-nums">+{STAKING.rewards} TON</p>
        </div>
        <PopButton tone="secondary" size="sm" onClick={handleClaim} disabled={busy !== null}>
          {busy === "claim" ? "Claiming…" : "Claim"}
        </PopButton>
      </section>

      {/* Stake form */}
      <section className="game-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-success" />
          <h2 className="font-display font-bold">Add to your stake</h2>
        </div>

        <div className="bg-muted/60 border-2 border-border rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>Amount</span>
            <button
              onClick={() => setAmount(String(ton.balance))}
              className="press-effect chip bg-primary-soft text-primary-deep"
            >
              MAX
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.0"
              className="flex-1 min-w-0 bg-transparent outline-none font-display text-3xl font-bold tabular-nums"
            />
            <span className="font-display font-bold">TON</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Balance: {ton.balance} TON · ≈ ${(parseFloat(amount || "0") * ton.priceUsd).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between bg-success/15 border-2 border-success/40 rounded-2xl px-4 py-3">
          <div>
            <p className="text-xs font-bold text-success-foreground/80">Estimated yearly</p>
            <p className="font-display text-lg font-bold text-success-foreground tabular-nums">
              +{yearly.toFixed(3)} TON
            </p>
          </div>
          <ShieldCheck className="w-6 h-6 text-success-foreground/70" />
        </div>

        <PopButton tone="primary" size="lg" block onClick={handleStake} disabled={busy !== null || !parseFloat(amount)}>
          {busy === "stake" ? "Staking…" : "Stake TON"}
        </PopButton>
      </section>

      <FoxBuddy
        message={
          <span>
            Staking is like planting seeds 🌱 — leave them be and they grow daily.
          </span>
        }
      />
    </div>
  );
};
