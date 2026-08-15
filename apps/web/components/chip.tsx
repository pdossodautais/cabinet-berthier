import * as React from "react";
import { cn } from "@repo/ui/utils";

type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  active?: boolean;
  as?: "span" | "button";
  asChild?: boolean;
};

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, active = false, children, ...rest }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.02em] rounded-full border transition-colors select-none",
        active
          ? "bg-ink text-paper border-ink"
          : "bg-transparent text-ink-2 border-hairline-strong hover:border-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  ),
);
Chip.displayName = "Chip";
