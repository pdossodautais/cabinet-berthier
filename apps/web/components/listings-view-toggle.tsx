"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@repo/ui/utils";

const ICONS = {
  split: (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14l7 7M14 21l7-7" />
    </svg>
  ),
  grid: (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="5" />
      <rect x="3" y="15" width="18" height="5" />
    </svg>
  ),
  map: (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" />
      <path d="M9 3v16M15 5v16" />
    </svg>
  ),
};

const VIEWS = [
  { value: "split", icon: ICONS.split, label: "Liste + carte" },
  { value: "grid", icon: ICONS.grid, label: "Liste" },
  { value: "map", icon: ICONS.map, label: "Carte" },
] as const;

export function ListingsViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("vue") || "split";

  const setView = useCallback(
    (v: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (v === "split") params.delete("vue");
      else params.set("vue", v);
      router.push(`/biens?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div
      className="hidden md:flex items-center gap-0 text-[12px]"
      role="tablist"
      aria-label="Vue des biens"
    >
      {VIEWS.map((v, i) => {
        const active = current === v.value;
        return (
          <button
            key={v.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setView(v.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 transition-colors",
              i > 0 && "border-l border-hairline",
              active
                ? "text-ink font-medium"
                : "text-ink-muted hover:text-ink",
            )}
          >
            <span className={active ? "" : "opacity-60"}>{v.icon}</span>
            <span>{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
