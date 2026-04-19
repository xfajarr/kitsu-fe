import * as React from "react";
import { Flame, Trophy } from "lucide-react";
import tonCoin from "@/assets/ton-coin.png";
import { cn } from "@/lib/utils";
import { WalletButton } from "@/components/WalletButton";

type Props = {
  level: number;
  xp: number;
  xpNext: number;
  streak: number;
  username: string;
};

export const TopBar: React.FC<Props> = ({ level, xp, xpNext, streak, username }) => {
  const pct = Math.min(100, Math.round((xp / xpNext) * 100));
  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto max-w-md px-4 pt-4 pb-3 flex items-center gap-3">
        {/* Avatar / level badge */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-primary-soft border-2 border-primary/40 flex items-center justify-center overflow-hidden">
            <img src={tonCoin} alt="" width={48} height={48} className="w-9 h-9 animate-float" />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold font-display rounded-full px-1.5 py-0.5 border-2 border-background">
            Lv {level}
          </span>
        </div>

        {/* XP */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display font-bold text-sm truncate">Hi, {username}</p>
            <p className="text-[11px] font-bold text-muted-foreground tabular-nums">
              {xp}/{xpNext} XP
            </p>
          </div>
          <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden border border-border">
            <div
              className={cn("h-full bg-secondary-deep transition-all duration-500")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="shrink-0 flex items-center gap-1 bg-warning/30 border-2 border-warning/60 text-warning-foreground rounded-2xl px-2.5 py-1.5">
          <Flame className="w-4 h-4" />
          <span className="font-display font-bold text-sm tabular-nums">{streak}</span>
        </div>
        <div className="shrink-0 flex items-center gap-1 bg-secondary-soft border-2 border-secondary/70 text-secondary-foreground rounded-2xl px-2.5 py-1.5">
          <Trophy className="w-4 h-4" />
        </div>
        
        {/* Wallet Button */}
        <WalletButton />
      </div>
    </header>
  );
};
