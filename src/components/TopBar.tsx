import * as React from "react";
import { User } from "lucide-react";
import tonCoin from "@/assets/ton-coin.png";
import { cn } from "@/lib/utils";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { WalletButton } from "@/components/WalletButton";
import type { TabKey } from "@/components/BottomNav";

type Props = {
  level: number;
  xp: number;
  xpNext: number;
  streak: number;
  username: string;
  connected?: boolean;
  onNavigate?: (tab: TabKey) => void;
};

export const TopBar: React.FC<Props> = ({ level, xp, xpNext, streak, username, connected, onNavigate }) => {
  const pct = Math.min(100, Math.round((xp / xpNext) * 100));
  
  const handleProfileClick = () => {
    if (connected) {
      onNavigate?.("profile");
    }
  };
  
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

        {/* Username only - XP/streak/trophy hidden for now */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display font-bold text-sm truncate">Hi, {username}</p>
          </div>
          {/* Hidden XP bar - keeping for future, dimmed */}
          <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden border border-border opacity-30">
            <div
              className={cn("h-full bg-secondary-deep transition-all duration-500")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Profile Button - only show when connected */}
        {connected && (
          <button
            onClick={handleProfileClick}
            className="shrink-0 p-2 rounded-xl bg-muted border border-border press-effect"
            title="Profile"
          >
            <User className="w-5 h-5" />
          </button>
        )}
        
        <NetworkSwitcher />

        {/* Wallet Button */}
        <WalletButton />
      </div>
    </header>
  );
};
