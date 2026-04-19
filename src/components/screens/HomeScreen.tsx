import * as React from "react";
import { FoxBuddy } from "@/components/FoxBuddy";
import { PopButton } from "@/components/PopButton";
import { ArrowUpRight, Sparkles, ChevronRight, Vault, MessageCircleHeart, Wallet, Loader2 } from "lucide-react";
import type { TabKey } from "@/components/BottomNav";
import { usePortfolio } from "@/hooks/queries";

type Props = {
  onNavigate: (tab: TabKey) => void;
};

function AssetIcon({ symbol }: { symbol: string }) {
  const s = symbol.toUpperCase();
  const wrap = "w-10 h-10 rounded-2xl bg-muted border-2 border-border flex items-center justify-center shrink-0 p-1.5";
  if (s === "TON") {
    return (
      <div className={wrap}>
        <img src="/TON-white-icon.svg" alt="" className="w-7 h-7 object-contain" />
      </div>
    );
  }
  if (s === "USDT" || s === "USD₮") {
    return (
      <div className={wrap}>
        <img src="/tether-usdt-logo.svg" alt="" className="w-7 h-7 object-contain" />
      </div>
    );
  }
  if (s === "NEST") {
    return (
      <div className={`${wrap} bg-primary-soft border-primary/40`}>
        <span className="text-xl">🏢</span>
      </div>
    );
  }
  if (s === "GOAL") {
    return (
      <div className={`${wrap} bg-secondary-soft border-secondary/40`}>
        <span className="text-xl">🎯</span>
      </div>
    );
  }
  return (
    <div className={wrap}>
      <img src="/placeholder.svg" alt="" className="w-7 h-7 object-contain opacity-80" />
    </div>
  );
}

export const HomeScreen: React.FC<Props> = ({ onNavigate }) => {
  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolio();

  const portfolio = portfolioData?.portfolio;

  const greeting = React.useMemo(() => {
    const tips = [
      "Pop a few coins into a Money Den today — even $5 starts growing!",
      "Pssst… your saving streak is on fire. Keep it going!",
      "Set a goal and I'll cheer you on every step 🦊",
    ];
    return tips[new Date().getDay() % tips.length];
  }, []);

  if (portfolioLoading) {
    return (
      <div className="px-4 pt-2 pb-28 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              ${portfolio?.totalUsd?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || "0.00"}
            </h1>
            <span className={`chip mb-1.5 ${portfolio?.dayChangePct && portfolio.dayChangePct >= 0 ? 'bg-success/30 text-success-foreground' : 'bg-destructive/30 text-destructive'}`}>
              <ArrowUpRight className="w-3 h-3" />
              {portfolio?.dayChangePct?.toFixed(2) || "0.00"}%
            </span>
          </div>
          {/* <p className="text-xs text-muted-foreground mt-1">Updated just now · TON network</p> */}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <PopButton tone="primary" size="sm" onClick={() => onNavigate("nest")}>
              <Vault className="w-4 h-4" /> Nest Vaults
            </PopButton>
            <PopButton tone="secondary" size="sm" onClick={() => onNavigate("fox")}>
              <MessageCircleHeart className="w-4 h-4" /> Ask Foxy
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

      {/* Wealth Growth */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent-deep" />
            Wealth Growth
          </h2>
          <button
            onClick={() => onNavigate("nest")}
            className="text-xs font-bold text-muted-foreground inline-flex items-center"
          >
            View nests <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {portfolio?.assets && portfolio.assets.length > 0 ? (
          <div className="game-card divide-y divide-border">
            {portfolio.assets.map((t) => {
              const up = t.change24h >= 0;
              return (
                <div key={t.symbol} className="flex items-center gap-3 p-3">
                  <AssetIcon symbol={t.symbol} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display font-bold text-sm truncate">{t.symbol}</p>
                      <p className="font-display font-bold text-sm tabular-nums">
                        ${t.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {t.symbol}
                      </p>
                      <span
                        className={
                          "text-[11px] font-bold tabular-nums " +
                          (up ? "text-success-foreground" : "text-destructive")
                        }
                      >
                        {up ? "+" : ""}
                        {t.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="game-card p-6 text-center">
            <p className="text-muted-foreground text-sm">No assets yet. Connect your wallet to see your portfolio!</p>
          </div>
        )}
      </section>

      {/* Daily quests - Coming Soon */}
      <section className="relative overflow-hidden">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary-deep" />
            Daily quests
            <span className="chip bg-warning/30 text-warning-foreground border border-warning/60 text-[10px]">Coming Soon</span>
          </h2>
        </div>
        <div className="h-24 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Quests coming soon!</p>
        </div>
        <div className="absolute inset-0 bg-background/40 backdrop-blur-sm rounded-2xl" />
      </section>
    </div>
  );
};
