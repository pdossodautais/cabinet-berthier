"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Plus, Minus, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@repo/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/sheet";
import { PROPERTY_TYPES } from "@repo/shared/constants";

type FilterGroupProps = {
  title: string;
  defaultOpen?: boolean;
  first?: boolean;
  children: React.ReactNode;
};

function FilterGroup({
  title,
  children,
  defaultOpen = true,
  first = false,
}: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={first ? "py-5" : "py-5 rule"}>
      <button
        onClick={() => setOpen(!open)}
        className="group w-full flex justify-between items-center h-small-caps transition-colors hover:text-[color:var(--cobalt)]"
        aria-expanded={open}
      >
        {title}
        <span
          className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ color: "var(--cobalt)" }}
        >
          {open ? (
            <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
          ) : (
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          )}
        </span>
      </button>
      {open && <div className="mt-5">{children}</div>}
    </div>
  );
}

type ChipProps = {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

function Chip({ active, children, onClick, disabled }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="px-3 py-1.5 text-[12px] tracking-[0.08em] border disabled:opacity-50 transition-colors"
      style={{
        borderColor: active ? "var(--cobalt)" : "var(--bone-raw)",
        background: active ? "var(--cobalt)" : "transparent",
        color: active ? "white" : "var(--ink-raw)",
      }}
    >
      {children}
    </button>
  );
}

type Arrondissement = { code: string; label: string; count: number };
type City = { city: string; count: number };

type Props = {
  arrondissements: Arrondissement[];
  cities?: City[];
  /** "sidebar" (sticky) par défaut ; "drawer" retire le sticky pour être utilisé dans un Sheet. */
  mode?: "sidebar" | "drawer";
  /** Appelé après Appliquer / Réinitialiser — pour fermer le drawer. */
  onClose?: () => void;
};

const FEATURES = [
  "Balcon / Terrasse",
  "Ascenseur",
  "Cave",
  "Parking",
  "Cheminée",
  "Jardin",
  "Vue dégagée",
];

const ROOM_CHIPS = [
  { label: "Studio", value: "1" },
  { label: "2 p.", value: "2" },
  { label: "3 p.", value: "3" },
  { label: "4 p.", value: "4" },
  { label: "5 p.+", value: "5" },
];

export function BiensFiltersSidebar({
  arrondissements,
  cities = [],
  mode = "sidebar",
  onClose,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Après un changement de filtres, si la page raccourcit et que le scroll
  // précédent tombe dans le footer, on le ramène sur la dernière ligne
  // visible de contenu au lieu du vide.
  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const raf = requestAnimationFrame(() => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY > maxScroll && maxScroll >= 0) {
        window.scrollTo({ top: Math.max(0, maxScroll), behavior: "auto" });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [sp]);

  // Tous les filtres "discrets" (type, arr, ville, pièces, features) sont
  // multi-select : valeurs séparées par virgule en URL, manipulées comme
  // tableaux côté React.
  const splitParam = (key: string) =>
    sp.get(key)?.split(",").filter(Boolean) || [];
  const currentTypes = splitParam("type");
  const currentArrs = splitParam("arr");
  const currentCities = splitParam("ville");
  const currentFeatures = splitParam("features");
  const currentRooms = splitParam("pieces");
  const currentTx = sp.get("transaction") || "all";
  const hideSold = sp.get("hide_sold") === "1";

  const [prixMin, setPrixMin] = useState(sp.get("prix_min") || "");
  const [prixMax, setPrixMax] = useState(sp.get("prix_max") || "");
  const [surfMin, setSurfMin] = useState(sp.get("surface_min") || "");
  const [surfMax, setSurfMax] = useState(sp.get("surface_max") || "");

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp);
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [sp, pathname, router],
  );

  // Toggle générique sur un paramètre liste (type, arr, ville, pièces, features) :
  // ajoute la valeur si absente, la retire si présente. Les filtres restent
  // indépendants — sélectionner Paris 11ᵉ + Boulogne = un OU logique entre les
  // deux (le bien doit être dans Paris 11ᵉ OU à Boulogne).
  const toggleListParam = (key: string, value: string) => {
    const current = splitParam(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParam(key, next.join(",") || null);
  };

  const toggleFeature = (feat: string) => toggleListParam("features", feat);

  const applyBudget = () => {
    const params = new URLSearchParams(sp);
    if (prixMin) params.set("prix_min", prixMin);
    else params.delete("prix_min");
    if (prixMax) params.set("prix_max", prixMax);
    else params.delete("prix_max");
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
    onClose?.();
  };

  const applySurface = () => {
    const params = new URLSearchParams(sp);
    if (surfMin) params.set("surface_min", surfMin);
    else params.delete("surface_min");
    if (surfMax) params.set("surface_max", surfMax);
    else params.delete("surface_max");
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const resetAll = () => {
    setPrixMin("");
    setPrixMax("");
    setSurfMin("");
    setSurfMax("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
    onClose?.();
  };

  // Mode sidebar (par défaut) : sticky à 164px = pile sous la controls bar
  // sticky (header 77 + controls bar 87 = 164). On match exactement la
  // position naturelle de l'aside à scroll=0 → pas de petit décalage de
  // quelques pixels au moment où le sticky s'active.
  // Mode drawer : flex flex-col h-full pour que les boutons restent collés
  // en bas et que la zone filtres scrolle indépendamment.
  const isDrawer = mode === "drawer";
  return (
    <div
      className={
        isDrawer
          ? "flex flex-col h-full min-h-0"
          : "sticky top-[164px] flex flex-col"
      }
      style={
        isDrawer ? undefined : { maxHeight: "calc(100dvh - 188px)" }
      }
    >
      <div
        className={
          isDrawer
            ? "flex-1 min-h-0 overflow-y-auto scrollbar-editorial -mx-6 px-6"
            : "flex-1 overflow-y-auto scrollbar-editorial pr-1 -mr-1"
        }
      >
        <FilterGroup title="Nature" first>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <Chip
              key={t.value}
              active={currentTypes.includes(t.value)}
              onClick={() => toggleListParam("type", t.value)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        title={cities.length > 0 ? "Localisation" : "Arrondissement"}
      >
        <div className="space-y-3">
          {arrondissements.length > 0 && (
            <>
              {cities.length > 0 && (
                <div
                  className="h-eyebrow"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Paris
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {arrondissements.map((a) => {
                  const active = currentArrs.includes(a.code);
                  return (
                    <Chip
                      key={a.code}
                      active={active}
                      onClick={() => toggleListParam("arr", a.code)}
                    >
                      {a.code}
                      <span
                        className="opacity-70 ml-1 mono text-[10px]"
                        style={{
                          color: active ? "white" : undefined,
                        }}
                      >
                        {a.count}
                      </span>
                    </Chip>
                  );
                })}
              </div>
            </>
          )}
          {cities.length > 0 && (
            <>
              <div
                className="h-eyebrow pt-1"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                Autres villes
              </div>
              <div className="flex flex-wrap gap-2">
                {cities.map((c) => {
                  const active = currentCities.includes(c.city);
                  return (
                    <Chip
                      key={c.city}
                      active={active}
                      onClick={() => toggleListParam("ville", c.city)}
                    >
                      {c.city}
                      <span
                        className="opacity-70 ml-1 mono text-[10px]"
                        style={{
                          color: active ? "white" : undefined,
                        }}
                      >
                        {c.count}
                      </span>
                    </Chip>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </FilterGroup>

      <FilterGroup title="Budget">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Min"
              value={prixMin}
              onChange={(e) =>
                setPrixMin(e.target.value.replace(/[^0-9]/g, ""))
              }
              onBlur={applyBudget}
              className="w-full px-3 py-2 bg-transparent border text-[13px] tabular rounded-none transition-colors duration-200 focus:border-[color:var(--cobalt)]"
              style={{ borderColor: "var(--bone-raw)" }}
            />
            <span className="h-eyebrow">à</span>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Max"
              value={prixMax}
              onChange={(e) =>
                setPrixMax(e.target.value.replace(/[^0-9]/g, ""))
              }
              onBlur={applyBudget}
              className="w-full px-3 py-2 bg-transparent border text-[13px] tabular rounded-none transition-colors duration-200 focus:border-[color:var(--cobalt)]"
              style={{ borderColor: "var(--bone-raw)" }}
            />
          </div>
          <div
            className="h-eyebrow"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
            }}
          >
            {currentTx === "location" ? "€ / mois" : "€ · budget total"}
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Surface &amp; pièces">
        <div className="space-y-3 text-[13px]">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="m² min"
              value={surfMin}
              onChange={(e) =>
                setSurfMin(e.target.value.replace(/[^0-9]/g, ""))
              }
              onBlur={applySurface}
              className="w-full px-3 py-2 bg-transparent border tabular rounded-none transition-colors duration-200 focus:border-[color:var(--cobalt)]"
              style={{ borderColor: "var(--bone-raw)" }}
            />
            <Input
              type="text"
              inputMode="numeric"
              placeholder="m² max"
              value={surfMax}
              onChange={(e) =>
                setSurfMax(e.target.value.replace(/[^0-9]/g, ""))
              }
              onBlur={applySurface}
              className="w-full px-3 py-2 bg-transparent border tabular rounded-none transition-colors duration-200 focus:border-[color:var(--cobalt)]"
              style={{ borderColor: "var(--bone-raw)" }}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {ROOM_CHIPS.map((r) => (
              <Chip
                key={r.value}
                active={currentRooms.includes(r.value)}
                onClick={() => toggleListParam("pieces", r.value)}
              >
                {r.label}
              </Chip>
            ))}
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Caractéristiques" defaultOpen={false}>
        <div className="space-y-3 text-[13px]">
          {FEATURES.map((c) => {
            const active = currentFeatures.includes(c);
            return (
              <label
                key={c}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <span
                  className="w-4 h-4 border inline-flex items-center justify-center shrink-0"
                  style={{
                    borderColor: active ? "var(--cobalt)" : "var(--ink-raw)",
                    background: active ? "var(--cobalt)" : "transparent",
                  }}
                  aria-hidden="true"
                >
                  {active && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 5 5 9-11" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={active}
                  onChange={() => toggleFeature(c)}
                />
                {c}
              </label>
            );
          })}
        </div>
      </FilterGroup>

      {/* Inclure les biens vendus / loués — checkbox éditoriale :
          même style que les Caractéristiques (carré cobalt + check white).
          Par défaut l'archive est cachée ; le toggle ouvre la preuve sociale. */}
      <FilterGroup title="Archive" defaultOpen={false}>
        <label className="flex items-start gap-3 cursor-pointer select-none text-[13px]">
          <span
            className="mt-0.5 w-4 h-4 border inline-flex items-center justify-center shrink-0"
            style={{
              borderColor: hideSold ? "var(--cobalt)" : "var(--ink-raw)",
              background: hideSold ? "var(--cobalt)" : "transparent",
            }}
            aria-hidden="true"
          >
            {hideSold && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m5 12 5 5 9-11" />
              </svg>
            )}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={hideSold}
            onChange={(e) =>
              updateParam("hide_sold", e.target.checked ? "1" : null)
            }
          />
          <span className="flex flex-col gap-1">
            <span>Masquer les biens vendus / loués</span>
            <span
              className="h-eyebrow"
              style={{
                color:
                  "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
              }}
            >
              Voir aussi notre archive — preuve d&apos;activité.
            </span>
          </span>
        </label>
      </FilterGroup>
      </div>

      {/* Boutons d'action — restent visibles en bas grâce au flex layout
          (shrink-0). Sur écran court ils sont toujours accessibles sans
          scroller la sidebar. */}
      <div
        className={
          isDrawer
            ? "shrink-0 pt-4 -mx-6 px-6 pb-4 bg-paper"
            : "shrink-0 pt-4 mt-2"
        }
        style={{ borderTop: "1px solid var(--bone-raw)" }}
      >
        <button
          onClick={applyBudget}
          className="btn-ink w-full justify-center"
          disabled={pending}
        >
          <span className="relative z-[1] inline-flex items-center gap-2">
            Appliquer
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
        </button>
        <button
          onClick={resetAll}
          className="mt-3 w-full h-small-caps py-3 transition-colors duration-200 hover:text-[color:var(--ink-raw)]"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

/** Bouton qui ouvre un drawer avec les mêmes filtres que la sidebar.
 *  Utilisé en vue carte (pas de sidebar) et en mobile. */
export function BiensFiltersDrawerButton({
  arrondissements,
  cities = [],
  className,
}: {
  arrondissements: Arrondissement[];
  cities?: City[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const sp = useSearchParams();

  const activeCount = Array.from(sp.entries()).filter(
    ([k, v]) =>
      v &&
      ![
        "page",
        "vue",
        "tri",
        "transaction",
        "q",
      ].includes(k),
  ).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={"group " + (className ?? "")}
        style={{
          borderColor: "var(--ink-raw)",
        }}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="h-small-caps">Filtres</span>
        {activeCount > 0 && (
          <span
            key={`filter-count-${activeCount}`}
            className="mono text-[10px] tabular px-1.5 py-0.5"
            style={{
              background: "var(--cobalt)",
              color: "white",
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="!w-full sm:!max-w-md bg-paper p-0 !gap-0 flex flex-col overflow-hidden"
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
                  Nº 02 — Filtres
                </div>
                <SheetTitle
                  className="h-display text-left"
                  style={{ fontSize: 28, lineHeight: 1.1 }}
                >
                  Affinez votre
                  <br />
                  <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                    recherche.
                  </em>
                </SheetTitle>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="group w-9 h-9 inline-flex items-center justify-center shrink-0 transition-colors duration-200 hover:bg-[color:var(--ivory-raw)] hover:border-[color:var(--ink-raw)]"
                style={{ border: "1px solid var(--bone-raw)" }}
              >
                <X className="h-4 w-4" strokeWidth={1.4} />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 min-h-0 px-6 pt-6 flex flex-col">
            <BiensFiltersSidebar
              arrondissements={arrondissements}
              cities={cities}
              mode="drawer"
              onClose={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
