"use client";

/**
 * Toggle Carte / Liste segmenté pour mobile, visible dans les DEUX vues
 * de /biens (grille par défaut OU carte via ?vue=map).
 *
 * Position fixe en bas-centre, esthétique ink/paper du site.
 */
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Map as MapIcon, List as ListIcon } from "lucide-react";

export function BiensViewFab() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const isMap = sp.get("vue") === "map";

  const setView = useCallback(
    (target: "grid" | "map") => {
      const params = new URLSearchParams(sp.toString());
      if (target === "map") params.set("vue", "map");
      else params.delete("vue");
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, sp, pathname],
  );

  const segmentBase =
    "inline-flex items-center gap-2 px-5 py-3 text-[11px] tracking-[0.22em] uppercase transition-colors disabled:opacity-70";

  return (
    <div
      className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex"
      role="group"
      aria-label="Basculer entre carte et liste"
      style={{
        background: "var(--ink-raw)",
        border: "1px solid var(--ink-raw)",
        boxShadow: "0 8px 24px rgba(11, 16, 32, 0.18)",
      }}
    >
      <button
        type="button"
        onClick={() => setView("map")}
        aria-pressed={isMap}
        disabled={pending}
        className={segmentBase}
        style={{
          background: isMap ? "var(--paper-raw)" : "var(--ink-raw)",
          color: isMap ? "var(--ink-raw)" : "var(--paper-raw)",
        }}
      >
        <MapIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        Carte
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-pressed={!isMap}
        disabled={pending}
        className={segmentBase}
        style={{
          background: !isMap ? "var(--paper-raw)" : "var(--ink-raw)",
          color: !isMap ? "var(--ink-raw)" : "var(--paper-raw)",
        }}
      >
        <ListIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        Liste
      </button>
    </div>
  );
}
