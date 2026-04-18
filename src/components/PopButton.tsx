import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "accent" | "muted";
  size?: "sm" | "md" | "lg";
  block?: boolean;
};

const toneMap = {
  primary: "bg-primary text-primary-foreground pop-shadow",
  secondary: "bg-secondary text-secondary-foreground pop-shadow-secondary",
  accent: "bg-accent text-accent-foreground pop-shadow-accent",
  muted: "bg-muted text-foreground pop-shadow-muted",
} as const;

const sizeMap = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-lg",
} as const;

/** Chunky, Brawl-Stars-style action button with a "pop" shadow. */
export const PopButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ tone = "primary", size = "md", block, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-display font-bold tracking-tight",
        "press-effect select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0",
        toneMap[tone],
        sizeMap[size],
        block && "w-full",
        className,
      )}
    >
      {children}
    </button>
  ),
);
PopButton.displayName = "PopButton";
