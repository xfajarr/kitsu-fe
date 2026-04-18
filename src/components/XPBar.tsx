import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number; // 0..1
  tone?: "primary" | "secondary" | "accent" | "success";
  className?: string;
  showLabel?: boolean;
};

const toneMap = {
  primary: "bg-primary",
  secondary: "bg-secondary-deep",
  accent: "bg-accent-deep",
  success: "bg-success",
} as const;

export const XPBar: React.FC<Props> = ({ value, tone = "secondary", className, showLabel }) => {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={cn("w-full", className)}>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border">
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneMap[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-[11px] font-bold text-muted-foreground mt-1 text-right">{pct}%</div>
      )}
    </div>
  );
};
