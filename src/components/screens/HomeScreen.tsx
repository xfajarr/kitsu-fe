import * as React from "react";
import { FoxBuddy } from "@/components/FoxBuddy";
import { PopButton } from "@/components/PopButton";
import { XPBar } from "@/components/XPBar";
import { QUESTS, STAKING } from "@/data/mock";
import { ArrowUpRight, Sparkles, ChevronRight, Sprout, ArrowLeftRight, Gem } from "lucide-react";
import treasureChest from "@/assets/treasure-chest.png";
import type { TabKey } from "@/components/BottomNav";

type Props = {
  portfolioUsd: number;
  dayChangePct: number;
  onNavigate: (tab: TabKey) => void;
};

export const HomeScreen: React.FC<Props> = ({ portfolioUsd, dayChangePct, onNavigate }) => {
  const greeting = React.useMemo(() => {
    const tips = [
      "Stake 10 TON today and earn ~4.8% APR. Easy first step!",
      "Pssst… your saving streak is on fire. Keep it going!",
      "New quest unlocked: try a treasure pool for bonus XP 🪙",
    ];
    return tips[new Date().getDay() % tips.length];
  }, []);

  return (
    <div className="px-4 pt-2 pb-28 space-y-5 animate-fade-in">
      {/* Portfolio hero card */}
      <section className="game-card p-5 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-soft"
        />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your wealth
          </p>
          <div className="flex items-end gap-2 mt-1">
            <h1 className="font-display text-4xl font-bold tabular-nums">
              ${portfolioUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </h1>
            <span className="chip bg-success/30 text-success-foreground mb-1.5">
              <ArrowUpRight className="w-3 h-3" />
              {dayChangePct.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Updated just now · TON network</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <PopButton tone="primary" size="sm" onClick={() => onNavigate("swap")}>
              <ArrowLeftRight className="w-4 h-4" /> Swap
            </PopButton>
            <PopButton tone="secondary" size="sm" onClick={() => onNavigate("stake")}>
              <Sprout className="w-4 h-4" /> Stake
            </PopButton>
            <PopButton tone="accent" size="sm" onClick={() => onNavigate("pools")}>
              <Gem className="w-4 h-4" /> Pools
            </PopButton>
          </div>
        </div>
      </section>

      {/* Fox tip */}
      <section aria-label="Fox AI tip">
        <FoxBuddy
          message={
            <span>
              <span className="font-display text-primary-deep">Foxy says:</span>{" "}
              {greeting}
            </span>
          }
        />
      </section>

      {/* Daily quests */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary-deep" />
            Daily quests
          </h2>
          <button className="text-xs font-bold text-muted-foreground inline-flex items-center">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {QUESTS.slice(0, 3).map((q) => (
            <article
              key={q.id}
              className="game-card p-4 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary-soft border-2 border-secondary/60 flex items-center justify-center shrink-0">
                <img src={treasureChest} alt="" width={48} height={48} loading="lazy" className="w-9 h-9" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display font-bold text-sm truncate">{q.title}</p>
                  <span className="chip bg-secondary-soft text-secondary-foreground border border-secondary/60">
                    +{q.reward} XP
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{q.hint}</p>
                <XPBar value={q.progress} className="mt-2" tone="secondary" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Staking summary */}
      <section className="game-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              TON Staking
            </p>
            <p className="font-display text-2xl font-bold mt-0.5 tabular-nums">
              {STAKING.staked} TON
            </p>
            <p className="text-xs text-muted-foreground">
              Earning <span className="text-success-foreground font-bold">{STAKING.apr}%</span> APR
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending
            </p>
            <p className="font-display text-xl font-bold tabular-nums text-secondary-deep">
              +{STAKING.rewards} TON
            </p>
            <PopButton tone="secondary" size="sm" className="mt-2" onClick={() => onNavigate("stake")}>
              Claim
            </PopButton>
          </div>
        </div>
      </section>
    </div>
  );
};
