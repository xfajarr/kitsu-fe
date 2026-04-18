import * as React from "react";
import { Home, Vault, MessageCircleHeart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "home" | "dens" | "fox" | "profile";

const tabs: { key: TabKey; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "dens", label: "Dens", Icon: Vault },
  { key: "fox", label: "Foxy", Icon: MessageCircleHeart },
  { key: "profile", label: "Me", Icon: User },
];

type Props = {
  active: TabKey;
  onChange: (k: TabKey) => void;
};

export const BottomNav: React.FC<Props> = ({ active, onChange }) => (
  <nav
    aria-label="Primary"
    className="fixed bottom-0 inset-x-0 z-30 safe-bottom"
  >
    <div className="mx-auto max-w-md px-3 pb-3">
      <div className="bg-card border-2 border-border rounded-3xl px-2 py-2 flex items-center justify-between shadow-[0_8px_24px_-8px_hsl(25_30%_30%/0.18)]">
        {tabs.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-colors",
                "press-effect",
                isActive ? "bg-primary-soft text-primary-deep" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span className="text-[11px] font-bold font-display">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);
