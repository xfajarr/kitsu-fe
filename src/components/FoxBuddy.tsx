import * as React from "react";
import { cn } from "@/lib/utils";
import foxImg from "@/assets/fox-mascot.png";

type Props = {
  message: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  align?: "left" | "right";
};

/** The FoxFi mascot with a speech bubble. Friendly tips and nudges. */
export const FoxBuddy: React.FC<Props> = ({ message, size = "md", className, align = "left" }) => {
  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  } as const;

  return (
    <div
      className={cn(
        "flex items-end gap-3",
        align === "right" && "flex-row-reverse",
        className,
      )}
    >
      <img
        src={foxImg}
        alt="Fox AI assistant"
        loading="lazy"
        width={256}
        height={256}
        className={cn(sizes[size], "shrink-0 animate-float drop-shadow-md select-none")}
        draggable={false}
      />
      <div
        className={cn(
          "relative bg-card rounded-3xl border-2 border-border px-4 py-3 max-w-[260px] text-sm font-semibold leading-snug",
          "shadow-[0_4px_0_0_hsl(var(--border))]",
        )}
      >
        {message}
        <span
          aria-hidden
          className={cn(
            "absolute bottom-3 w-3 h-3 rotate-45 bg-card border-l-2 border-b-2 border-border",
            align === "left" ? "-left-[7px]" : "-right-[7px] border-r-2 border-t-2 border-l-0 border-b-0",
          )}
        />
      </div>
    </div>
  );
};
