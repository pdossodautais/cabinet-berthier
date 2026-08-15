"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export function FeaturesList({
  items,
  initialCount = 9,
}: {
  items: string[];
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > initialCount;
  const visible = expanded || !hasMore ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2.5 max-w-[640px]">
        {visible.map((t) => (
          <div
            key={t}
            className="flex items-center gap-2 text-[13px] text-ink-2"
          >
            <Check
              className="h-3.5 w-3.5 text-brass-deep shrink-0"
              strokeWidth={1.5}
            />
            {t}
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-5 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-ink-muted hover:text-ink transition-colors"
        >
          <span>
            {expanded
              ? "Voir moins"
              : `Voir les ${hiddenCount} autre${hiddenCount > 1 ? "s" : ""} prestation${hiddenCount > 1 ? "s" : ""}`}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
}
