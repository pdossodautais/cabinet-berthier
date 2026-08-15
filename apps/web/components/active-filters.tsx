"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import {
  TRANSACTION_TYPES,
  PROPERTY_TYPES,
  ROOM_OPTIONS,
} from "@repo/shared/constants";

const LABELS: Record<string, (v: string) => string> = {
  transaction: (v) =>
    TRANSACTION_TYPES.find((t) => t.value === v)?.label || v,
  type: (v) => PROPERTY_TYPES.find((t) => t.value === v)?.label || v,
  pieces: (v) =>
    `${ROOM_OPTIONS.find((r) => r.value === v)?.label || v} ${v === "5" ? "p+" : "p."}`,
  ville: (v) => v,
  q: (v) => `« ${v} »`,
  prix_min: (v) => `> ${formatNum(v)} €`,
  prix_max: (v) => `< ${formatNum(v)} €`,
  surface_min: (v) => `> ${v} m²`,
  tri: () => "",
};

function formatNum(s: string) {
  const n = Number(s);
  if (Number.isNaN(n)) return s;
  return n.toLocaleString("fr-FR");
}

const HIDE = new Set(["page", "tri", "vue"]);

export function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const remove = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.delete("page");
      router.push(`/biens?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearAll = useCallback(() => {
    router.push("/biens");
  }, [router]);

  const active = Array.from(searchParams.entries()).filter(
    ([k, v]) => v && !HIDE.has(k),
  );

  if (active.length === 0) {
    return (
      <span className="text-[12px] text-ink-subtle italic">
        Aucun filtre
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      {active.map(([key, value]) => (
        <button
          key={key}
          type="button"
          onClick={() => remove(key)}
          className="inline-flex items-center gap-1.5 px-3 h-8 text-xs tracking-[0.02em] rounded-full bg-ink text-paper border border-ink hover:bg-ink-2 transition-colors shrink-0"
          aria-label={`Retirer le filtre ${LABELS[key]?.(value) || value}`}
        >
          <span>{LABELS[key]?.(value) || value}</span>
          <X className="h-3 w-3" strokeWidth={1.5} />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-[12px] text-ink-muted hover:text-ink transition-colors ml-1 shrink-0"
      >
        Tout effacer
      </button>
    </div>
  );
}
