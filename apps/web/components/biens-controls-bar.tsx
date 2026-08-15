"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Grid as GridIcon, Map as MapIcon, Bell, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { BiensFiltersDrawerButton } from "./biens-filters-sidebar";
import { PropertyAlertInline } from "./property-alert-inline";

type TxCount = { value: "all" | "vente" | "location"; label: string; count: number };

type Arrondissement = { code: string; label: string; count: number };
type City = { city: string; count: number };

type Props = {
  counts: TxCount[];
  arrondissements: Arrondissement[];
  cities?: City[];
  /** En vue carte on affiche toujours le drawer filtres (pas de sidebar). */
  alwaysShowFiltersButton?: boolean;
};

const SORT_OPTIONS = [
  { value: "recent", label: "Sélection" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
  { value: "surface_desc", label: "Surface" },
];

export function BiensControlsBar({
  counts,
  arrondissements,
  cities = [],
  alwaysShowFiltersButton = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentTx = sp.get("transaction") || "all";
  const currentSort = sp.get("tri") || "recent";
  const currentView = (sp.get("vue") || "grid") as "grid" | "map";
  const [alertOpen, setAlertOpen] = useState(false);

  // Récap lisible des filtres actifs pour l'utilisateur (header du Sheet alerte).
  const activeFiltersSummary = (() => {
    const parts: string[] = [];
    const tx = sp.get("transaction");
    if (tx === "vente") parts.push("À vendre");
    else if (tx === "location") parts.push("À louer");
    const types = sp.get("type")?.split(",").filter(Boolean) ?? [];
    if (types.length) parts.push(types.map((t) => t[0].toUpperCase() + t.slice(1)).join(" · "));
    const arrs = sp.get("arr")?.split(",").filter(Boolean) ?? [];
    const villes = sp.get("ville")?.split(",").filter(Boolean) ?? [];
    if (arrs.length) parts.push(arrs.map((a) => `Paris ${a}`).join(" · "));
    if (villes.length) parts.push(villes.join(" · "));
    if (sp.get("prix_max")) parts.push(`max ${Number(sp.get("prix_max")).toLocaleString("fr-FR")} €`);
    if (sp.get("surface_min")) parts.push(`≥ ${sp.get("surface_min")} m²`);
    const pieces = sp.get("pieces")?.split(",").filter(Boolean) ?? [];
    if (pieces.length) parts.push(`${pieces.join("/")} pièce${pieces.some((p) => Number(p) > 1) ? "s" : ""}`);
    return parts.length ? parts.join(" · ") : "Tous les biens";
  })();

  // Scroll à l'ancre placée juste avant la controls bar sticky. Sa position
  // dans le document reste stable (pas affectée par le sticky qui s'active).
  // On remonte de 40px pour laisser un peu d'air au-dessus de la bar et
  // éviter qu'elle se colle visuellement sur la première ligne de cards.
  function scrollToControlsBar() {
    const anchor = document.querySelector<HTMLElement>(
      "[data-biens-bar-anchor]",
    );
    if (!anchor) return;
    const top = anchor.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  }

  // Quand l'utilisateur quitte la vue carte pour revenir en vue grille,
  // le layout change complètement (composant démonté/remonté). Le body
  // était en overflow:hidden donc le scroll est à 0 — on arrive en haut
  // de la page au lieu de la controls bar. On passe par sessionStorage
  // car les deux instances de BiensControlsBar (map / grid) ne partagent
  // pas leur state React.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentView !== "grid") return;
    if (sessionStorage.getItem("biens:scrollToBarOnGrid") !== "1") return;
    sessionStorage.removeItem("biens:scrollToBarOnGrid");
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToControlsBar);
    });
  }, [currentView]);

  // Tout changement de searchParams (page, filtres, tri…) en vue grille
  // ramène l'utilisateur au niveau de la controls bar pour qu'il voie
  // immédiatement le nouveau contenu (pas coincé loin sous la grille).
  const firstRenderRef = useRef(true);
  const prevSpRef = useRef(sp.toString());
  useEffect(() => {
    const spKey = sp.toString();
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      prevSpRef.current = spKey;
      return;
    }
    if (prevSpRef.current === spKey) return;
    prevSpRef.current = spKey;
    if (currentView !== "grid") return;
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToControlsBar);
    });
  }, [sp, currentView]);

  const update = useCallback(
    (key: string, value: string | null) => {
      // Avant de push, détecter la transition map → grid pour signaler
      // au prochain composant qu'il doit scroller à la controls bar.
      if (key === "vue" && currentView === "map" && value !== "map") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("biens:scrollToBarOnGrid", "1");
        }
      }
      const params = new URLSearchParams(sp);
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [sp, pathname, router, currentView],
  );

  return (
    <div
      data-biens-controls-bar
      className="flex flex-col md:flex-row gap-6 md:items-center justify-between py-5"
      style={{
        borderBottom: "1px solid var(--bone-raw)",
      }}
    >
      {/* Segmented tabs */}
      <div className="flex items-stretch">
        {counts.map((t, i) => {
          const active = currentTx === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => update("transaction", t.value === "all" ? null : t.value)}
              aria-pressed={active}
              disabled={pending}
              className={
                "px-5 min-h-11 flex items-center gap-2 transition-colors duration-200 " +
                (active ? "" : "hover:bg-[color:var(--ivory-raw)]")
              }
              style={{
                background: active ? "var(--ink-raw)" : undefined,
                color: active ? "var(--paper-raw)" : "var(--ink-raw)",
                borderRight:
                  i === counts.length - 1
                    ? "none"
                    : "1px solid var(--bone-raw)",
              }}
            >
              <span className="h-small-caps">{t.label}</span>
              <span className="mono text-[10px] tabular opacity-60">
                {String(t.count).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => setAlertOpen(true)}
          className="group inline-flex items-center gap-2 px-3 min-h-11 border transition-colors hover:bg-[color:var(--ivory-raw)]"
          style={{ borderColor: "var(--ink-raw)" }}
          aria-label="Créer une alerte e-mail sur ces critères"
        >
          <Bell className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="h-small-caps hidden sm:inline">Alerte mail</span>
        </button>

        <BiensFiltersDrawerButton
          arrondissements={arrondissements}
          cities={cities}
          className={
            (alwaysShowFiltersButton ? "inline-flex" : "inline-flex lg:hidden") +
            " items-center gap-2 px-3 min-h-11 border transition-colors hover:bg-[color:var(--ivory-raw)]"
          }
        />

        <Select
          value={currentSort}
          onValueChange={(v) => update("tri", v === "recent" ? null : v)}
          disabled={pending}
        >
          <SelectTrigger
            aria-label="Trier"
            className="h-auto border-0 bg-transparent rounded-none px-0 py-1 h-small-caps cursor-pointer focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none gap-2"
            style={{ color: "var(--ink-raw)" }}
          >
            <span>
              Tri ·{" "}
              {SORT_OPTIONS.find((s) => s.value === currentSort)?.label ||
                "Sélection"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className="hidden lg:flex border"
          style={{ borderColor: "var(--ink-raw)" }}
          role="group"
          aria-label="Vue"
        >
          <button
            type="button"
            onClick={() => update("vue", currentView === "grid" ? null : "grid")}
            aria-pressed={currentView === "grid"}
            className={
              "group h-11 w-11 inline-flex items-center justify-center transition-colors duration-200 " +
              (currentView === "grid" ? "" : "hover:bg-[color:var(--ivory-raw)]")
            }
            style={{
              background: currentView === "grid" ? "var(--ink-raw)" : undefined,
              color: currentView === "grid" ? "var(--paper-raw)" : "var(--ink-raw)",
            }}
            aria-label="Vue grille"
            disabled={pending}
          >
            <GridIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => update("vue", "map")}
            aria-pressed={currentView === "map"}
            className={
              "group h-11 w-11 inline-flex items-center justify-center border-l transition-colors duration-200 " +
              (currentView === "map" ? "" : "hover:bg-[color:var(--ivory-raw)]")
            }
            style={{
              background: currentView === "map" ? "var(--ink-raw)" : undefined,
              color: currentView === "map" ? "var(--paper-raw)" : "var(--ink-raw)",
              borderColor: "var(--ink-raw)",
            }}
            aria-label="Vue carte"
            disabled={pending}
          >
            <MapIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <Sheet open={alertOpen} onOpenChange={setAlertOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="!w-full sm:!max-w-md bg-paper p-0 !gap-0 flex flex-col"
        >
          <SheetHeader
            className="px-6 py-6 shrink-0"
            style={{ borderBottom: "1px solid var(--bone-raw)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div
                  className="chapter-mark mb-3"
                  style={{ color: "var(--cobalt)" }}
                >
                  Nº — Alerte
                </div>
                <SheetTitle
                  className="h-display text-left"
                  style={{ fontSize: 28, lineHeight: 1.1 }}
                >
                  Soyez prévenu
                  <br />
                  <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                    en exclusivité.
                  </em>
                </SheetTitle>
              </div>
              <button
                type="button"
                onClick={() => setAlertOpen(false)}
                aria-label="Fermer"
                className="group w-9 h-9 inline-flex items-center justify-center shrink-0 transition-colors duration-200 hover:bg-[color:var(--ivory-raw)] hover:border-[color:var(--ink-raw)]"
                style={{ border: "1px solid var(--bone-raw)" }}
              >
                <X className="h-4 w-4" strokeWidth={1.4} />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div>
              <p
                className="text-[14px] leading-[1.7] mb-4"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                }}
              >
                Vos critères actuels seront sauvegardés. Dès qu&apos;un nouveau
                bien correspondant est publié, vous recevrez un e-mail.
              </p>
              <div
                className="p-4 mb-6"
                style={{
                  background: "var(--ivory-raw)",
                  border: "1px solid var(--bone-raw)",
                }}
              >
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                  }}
                >
                  Critères enregistrés
                </div>
                <div
                  className="text-[14px] tabular"
                  style={{ color: "var(--ink-raw)" }}
                >
                  {activeFiltersSummary}
                </div>
              </div>
              <PropertyAlertInline />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
