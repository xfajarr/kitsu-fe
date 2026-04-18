import * as React from "react";
import { POOLS, type Pool } from "@/data/mock";
import { PopButton } from "@/components/PopButton";
import { FoxBuddy } from "@/components/FoxBuddy";
import treasureChest from "@/assets/treasure-chest.png";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const toneStyles = {
  primary: {
    badge: "bg-primary-soft text-primary-deep border-primary/40",
    halo: "bg-primary-soft",
  },
  secondary: {
    badge: "bg-secondary-soft text-secondary-foreground border-secondary/60",
    halo: "bg-secondary-soft",
  },
  accent: {
    badge: "bg-accent-soft text-accent-foreground border-accent/50",
    halo: "bg-accent-soft",
  },
} as const;

const PoolCard: React.FC<{ pool: Pool; onJoin: () => void }> = ({ pool, onJoin }) => {
  const t = toneStyles[pool.tone];
  return (
    <article className="game-card p-4 relative overflow-hidden">
      <div aria-hidden className={cn("absolute -top-6 -right-6 w-28 h-28 rounded-full", t.halo)} />
      <div className="relative flex items-center gap-3">
        <img src={treasureChest} alt="" loading="lazy" width={64} height={64} className="w-14 h-14 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold truncate">{pool.pair}</p>
          <p className="text-xs text-muted-foreground">TVL {pool.tvl}</p>
        </div>
        <span className={cn("chip border-2", t.badge)}>{pool.apr}% APR</span>
      </div>
      <div className="relative mt-3">
        <PopButton tone={pool.tone} size="sm" block onClick={onJoin}>
          <Plus className="w-4 h-4" /> Join treasure pool
        </PopButton>
      </div>
    </article>
  );
};

export const PoolsScreen: React.FC = () => {
  const [active, setActive] = React.useState<Pool | null>(null);
  const [amount, setAmount] = React.useState("25");
  const [busy, setBusy] = React.useState(false);

  const join = async () => {
    if (!active) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    toast.success(`Joined ${active.pair} pool with $${amount}`, {
      description: `+200 XP · earning ~${active.apr}% APR`,
    });
    setActive(null);
  };

  return (
    <div className="px-4 pt-2 pb-28 space-y-5 animate-fade-in">
      <div className="px-1">
        <h1 className="font-display text-2xl font-bold">Treasure Pools</h1>
        <p className="text-xs text-muted-foreground">Add liquidity on ston.fi · earn fees + bonuses</p>
      </div>

      <FoxBuddy
        message={
          <span>
            Pools share trading fees with you. Higher APR = a lustier chest 🪙
          </span>
        }
      />

      <section className="space-y-3">
        {POOLS.map((p) => (
          <PoolCard key={p.id} pool={p} onJoin={() => setActive(p)} />
        ))}
      </section>

      {active && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" role="dialog" aria-modal>
          <button
            aria-label="Close"
            onClick={() => setActive(null)}
            className="absolute inset-0 bg-foreground/30"
          />
          <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border-2 border-border p-5 animate-pop-in space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Join {active.pair}</h3>
              <button onClick={() => setActive(null)} className="press-effect w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-muted/60 border-2 border-border rounded-2xl p-4">
              <p className="text-xs font-bold text-muted-foreground">Your contribution (USD)</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-display text-2xl font-bold">$</span>
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="flex-1 min-w-0 bg-transparent outline-none font-display text-3xl font-bold tabular-nums"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Est. yearly: <span className="font-bold text-success-foreground">+${((parseFloat(amount || "0") * active.apr) / 100).toFixed(2)}</span>
              </p>
            </div>

            <PopButton tone={active.tone} size="lg" block onClick={join} disabled={busy || !parseFloat(amount)}>
              {busy ? "Joining…" : "Confirm"}
            </PopButton>
            <p className="text-[11px] text-muted-foreground text-center">
              Demo only — no real funds are moved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
