"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/select";
import { ArrowUpDown, SlidersHorizontal, Search, X, ArrowRight } from "lucide-react";
import { cn } from "@repo/ui/utils";
import { ActiveFilters } from "./active-filters";
import {
  PROPERTY_TYPES,
  ROOM_OPTIONS,
} from "@repo/shared/constants";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";

const labelCls =
  "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";

const SORT_OPTIONS = [
  { value: "recent", label: "Récents" },
  { value: "ancien", label: "Anciens" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
  { value: "surface_desc", label: "Plus grands" },
] as const;

const inputCls =
  "h-11 px-3 bg-paper border border-hairline-strong text-[13px] text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:border-ink w-full transition-colors duration-200";

export function ListingsFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/biens?${params.toString()}`);
    },
    [router, searchParams],
  );

  const currentTransaction = searchParams.get("transaction") || "";
  const currentSort = searchParams.get("tri") || "recent";

  return (
    <div className="h-full flex items-stretch divide-x divide-hairline">
      {/* Quick transaction chips — desktop large only (en dessous : dans le drawer Filtres) */}
      <div className="hidden xl:flex px-5 items-center gap-2 shrink-0">
        {[
          { value: "", label: "Tout" },
          { value: "vente", label: "Acheter" },
          { value: "location", label: "Louer" },
        ].map((opt) => {
          const active = currentTransaction === opt.value;
          return (
            <button
              key={opt.value || "all"}
              type="button"
              onClick={() => update("transaction", opt.value)}
              className={cn(
                "inline-flex items-center px-4 h-8 text-xs tracking-[0.02em] rounded-full border transition-colors duration-200 shrink-0",
                active
                  ? "bg-ink text-paper border-ink"
                  : "bg-transparent text-ink-2 border-hairline-strong hover:border-ink hover:bg-ivory-2",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Active filters chips — desktop large only (mobile + intermédiaire : dans le drawer) */}
      <div className="hidden xl:flex flex-1 min-w-0 px-5 items-center gap-2 overflow-x-auto scrollbar-none">
        <ActiveFiltersInline />
      </div>

      {/* + Filtres button — primary CTA on mobile (full row), secondary on desktop */}
      <div className="px-3 md:px-5 flex items-center shrink-0 flex-1 lg:flex-none justify-end lg:justify-start">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                className="group inline-flex items-center gap-1.5 px-4 h-9 text-[13px] tracking-[0.02em] rounded-full bg-ink text-paper max-lg:hover:bg-ink-2 lg:bg-transparent lg:text-ink-2 lg:border lg:border-hairline-strong lg:hover:border-ink lg:hover:bg-transparent lg:h-8 lg:text-xs lg:px-3 transition-colors duration-200"
              />
            }
          >
            <SlidersHorizontal className="h-3.5 w-3.5 lg:h-3 lg:w-3" strokeWidth={1.3} />
            <span>Filtres</span>
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            // Mêmes tokens que VisitRequestDrawer : largeur 32rem en md+,
            // fond paper, pas de padding externe, pas de gap Sheet par
            // défaut. Cohérence visuelle sur les deux drawers de la
            // fiche bien / catalogue.
            className="!w-full !sm:max-w-md bg-paper p-0 !gap-0 flex flex-col overflow-hidden"
          >
            {/* Header du drawer */}
            <div className="px-7 py-8 border-b border-hairline shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className={labelCls}>Recherche</span>
                  <SheetTitle className="text-[28px] font-normal tracking-[-0.01em] leading-[1.15] mt-3 text-ink">
                    Affinez vos critères,
                    <br />
                    <em className="italic">on trie pour vous.</em>
                  </SheetTitle>
                </div>
                <div className="flex items-center gap-1 shrink-0 -mt-1">
                  <ResetLink />
                  <Button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Fermer"
                    variant="ghost"
                    className="group w-9 h-9 inline-flex items-center justify-center text-ink-muted hover:text-ink hover:bg-ivory-2 transition-colors duration-200 rounded-none border-0"
                  >
                    <X className="h-4 w-4 icon-scale" strokeWidth={1.4} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Body scrollable */}
            <div className="scrollbar-editorial flex-1 overflow-y-auto">
              <FiltersForm onClose={() => setOpen(false)} />
            </div>

            {/* Footer sticky */}
            <div className="px-7 py-4 border-t border-hairline shrink-0 bg-paper">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="ghost"
                className="group btn-fill inline-flex items-center justify-center gap-2 w-full h-12 bg-ink text-paper text-[13px] font-medium tracking-[0.02em] hover:bg-ink-2 transition-all duration-300 rounded-none border-0"
              >
                <span className="relative z-[1] inline-flex items-center gap-2">
                  Voir les biens
                  <ArrowRight className="h-4 w-4 group-arrow" strokeWidth={1.4} />
                </span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sort dropdown — desktop large only (plus compact sur intermédiaire) */}
      <div className="px-5 hidden xl:flex items-center shrink-0">
        <Select
          value={currentSort}
          onValueChange={(v) => update("tri", !v || v === "recent" ? "" : v)}
        >
          <SelectTrigger
            aria-label="Trier"
            className="!h-8 !px-3 !bg-transparent !border-0 !shadow-none !text-[12px] !text-ink-muted hover:!text-ink focus-visible:!ring-0"
          >
            <ArrowUpDown
              className="h-3 w-3 mr-1.5 shrink-0"
              strokeWidth={1.3}
            />
            <span>
              Trier :{" "}
              {SORT_OPTIONS.find((s) => s.value === currentSort)?.label ||
                "Récents"}
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
      </div>
    </div>
  );
}

function ActiveFiltersInline() {
  return <ActiveFilters />;
}

// — Filters form inside the drawer —
function FiltersForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/biens?${params.toString()}`);
    },
    [router, searchParams],
  );

  const currentType = searchParams.get("type") || "";
  const currentRooms = searchParams.get("pieces") || "";
  const currentTransaction = searchParams.get("transaction") || "";
  const currentSort = searchParams.get("tri") || "recent";

  return (
    <div className="space-y-6 px-6 pt-6 pb-10">
      {/* Transaction quick toggle — visible dans le drawer jusqu'à xl (au-dessus : chips inline dans la barre) */}
      <div className="xl:hidden">
        <div className={`${labelCls} mb-3`}>Type de transaction</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "", label: "Tout" },
            { value: "vente", label: "Acheter" },
            { value: "location", label: "Louer" },
          ].map((opt) => {
            const active = currentTransaction === opt.value;
            return (
              <button
                key={opt.value || "all"}
                type="button"
                onClick={() => update("transaction", opt.value)}
                className={cn(
                  "py-2.5 text-[13px] border transition-colors duration-200",
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-hairline-strong hover:border-ink hover:bg-ivory-2",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <label className="block">
        <span className={`${labelCls} block mb-2`}>
          Rechercher
        </span>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle"
            strokeWidth={1.3}
          />
          <Input
            type="search"
            placeholder="Titre, ville, quartier…"
            defaultValue={searchParams.get("q") || ""}
            onBlur={(e) => update("q", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") update("q", e.currentTarget.value);
            }}
            className={cn(inputCls, "pl-10")}
          />
        </div>
      </label>

      {/* Type */}
      <div>
        <div className={`${labelCls} mb-3`}>Type de bien</div>
        <div className="grid grid-cols-2 gap-2">
          {[{ value: "", label: "Tous" }, ...PROPERTY_TYPES].map((t) => {
            const active = currentType === t.value;
            return (
              <button
                key={t.value || "all"}
                type="button"
                onClick={() => update("type", t.value)}
                className={cn(
                  "py-2.5 px-3 text-[13px] border transition-colors duration-200",
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-hairline-strong hover:border-ink hover:bg-ivory-2",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pièces */}
      <div>
        <div className={`${labelCls} mb-3`}>Pièces</div>
        <div className="grid grid-cols-6 gap-2">
          {[{ value: "", label: "Toutes" }, ...ROOM_OPTIONS].map((r) => {
            const active = currentRooms === r.value;
            return (
              <button
                key={r.value || "all"}
                type="button"
                onClick={() => update("pieces", r.value)}
                className={cn(
                  "py-2 text-[13px] border transition-colors duration-200",
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-hairline-strong hover:border-ink hover:bg-ivory-2",
                )}
              >
                {r.value === "5" ? "5+" : r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ville */}
      <label className="block">
        <span className={`${labelCls} block mb-2`}>
          Ville / quartier
        </span>
        <Input
          type="text"
          placeholder="Ville ou quartier…"
          defaultValue={searchParams.get("ville") || ""}
          onBlur={(e) => update("ville", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("ville", e.currentTarget.value);
          }}
          className={inputCls}
        />
      </label>

      {/* Prix */}
      <div>
        <div className={`${labelCls} mb-3`}>Budget</div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min €"
            defaultValue={searchParams.get("prix_min") || ""}
            onBlur={(e) => update("prix_min", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") update("prix_min", e.currentTarget.value);
            }}
            className={inputCls}
          />
          <Input
            type="number"
            placeholder="Max €"
            defaultValue={searchParams.get("prix_max") || ""}
            onBlur={(e) => update("prix_max", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") update("prix_max", e.currentTarget.value);
            }}
            className={inputCls}
          />
        </div>
      </div>

      {/* Surface */}
      <label className="block">
        <span className={`${labelCls} block mb-2`}>
          Surface minimum (m²)
        </span>
        <Input
          type="number"
          placeholder="—"
          defaultValue={searchParams.get("surface_min") || ""}
          onBlur={(e) => update("surface_min", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("surface_min", e.currentTarget.value);
          }}
          className={inputCls}
        />
      </label>

      {/* Sort — dans le drawer jusqu'à xl (au-dessus : dropdown inline dans la barre) */}
      <div className="xl:hidden">
        <div className={`${labelCls} mb-3`}>Trier par</div>
        <Select
          value={currentSort}
          onValueChange={(v) => update("tri", !v || v === "recent" ? "" : v)}
        >
          <SelectTrigger className={inputCls}>
            <span className="flex-1 text-left">
              {SORT_OPTIONS.find((s) => s.value === currentSort)?.label ||
                "Récents"}
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
      </div>
    </div>
  );
}

// — Lien "Réinitialiser" dans le header du drawer —
function ResetLink() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFilters = Array.from(searchParams.entries()).some(
    ([k, v]) => v && !["page", "vue"].includes(k),
  );
  if (!hasFilters) return null;
  return (
    <button
      type="button"
      onClick={() => router.push("/biens")}
      className="text-[12px] text-ink-muted hover:text-brass-deep underline underline-offset-4 decoration-hairline-strong transition-colors duration-200 px-2"
    >
      Réinitialiser
    </button>
  );
}
