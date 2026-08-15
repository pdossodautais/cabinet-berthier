"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyImage } from "@repo/ui/property-image";
import { cn } from "@repo/ui/utils";
import type { PropertyMedia } from "@repo/shared/supabase/types";
import { PropertyImagePlaceholder } from "./property-image-placeholder";

// Taille des dots (px) — utilisée pour le calcul du translate de la piste
// quand il y a plus de MAX_DOTS photos. Les dots non-actifs hors fenêtre
// scale à 0 → effet de « disparition » aux bords au lieu d'un saut brusque.
const MAX_DOTS = 5;
const DOT_WIDTH = 6; // largeur du bouton dot
const DOT_GAP = 6;   // gap-1.5 = 6px

export function PropertyCardCarousel({
  media,
  alt,
  priority = false,
}: {
  media: PropertyMedia[];
  alt: string;
  priority?: boolean;
}) {
  const sorted = [...media].sort((a, b) => a.position - b.position);
  const total = sorted.length;
  const [idx, setIdx] = useState(0);
  // `hydrated` reste false tant que l'utilisateur n'a pas interagi — tant
  // qu'on est à false on ne monte qu'UNE image (idx=0). Cela évite qu'au
  // premier rendu le browser ne sature la bande passante en préchargeant
  // les photos 2-5 de chaque PropertyCard sous le fold — le goulet
  // d'étranglement historique sur le LCP mobile (Slow 4G).
  const [hydrated, setHydrated] = useState(false);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const stop = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const goTo = useCallback(
    (n: number) => {
      if (total === 0) return;
      if (!hydrated) setHydrated(true);
      const next = ((n % total) + total) % total;
      setIdx(next);
    },
    [total, hydrated],
  );

  const prev = useCallback(
    (e: React.MouseEvent) => {
      stop(e);
      goTo(idx - 1);
    },
    [stop, goTo, idx],
  );
  const next = useCallback(
    (e: React.MouseEvent) => {
      stop(e);
      goTo(idx + 1);
    },
    [stop, goTo, idx],
  );

  function onTouchStart(e: React.TouchEvent) {
    if (!hydrated) setHydrated(true);
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }
  // Hover sur desktop = déjà une intention — on monte les autres images.
  function onPointerEnter() {
    if (!hydrated) setHydrated(true);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goTo(idx + 1);
      else goTo(idx - 1);
    }
    touchRef.current = null;
  }

  if (total === 0) {
    return (
      <div className="absolute inset-0">
        <PropertyImagePlaceholder variant="compact" />
      </div>
    );
  }

  // Fenêtre de dots visibles quand total > MAX_DOTS
  // - On rend TOUS les dots dans une piste flex
  // - La piste glisse horizontalement pour garder idx dans la fenêtre
  // - Les dots hors fenêtre scale à 0 (disparition douce, pas de saut)
  const showAllDots = total <= MAX_DOTS;
  let dotStart = 0;
  if (!showAllDots) {
    const half = Math.floor(MAX_DOTS / 2);
    dotStart = Math.max(0, Math.min(idx - half, total - MAX_DOTS));
  }
  const dotEnd = dotStart + Math.min(MAX_DOTS, total);
  const trackWidth = total * (DOT_WIDTH + DOT_GAP) - DOT_GAP;
  const viewportWidth = Math.min(MAX_DOTS, total) * (DOT_WIDTH + DOT_GAP) - DOT_GAP;

  // Liste effective des images à rendre côté DOM :
  // - Avant hydratation → uniquement l'image courante (idx) → 1 seul
  //   `<img>` par PropertyCard → la bande passante reste disponible pour
  //   le LCP hero.
  // - Après hydratation → tout le lot, sliding track classique.
  const renderList = hydrated
    ? sorted.map((m, i) => ({ m, i }))
    : sorted.filter((_, i) => i === idx).map((m) => ({ m, i: idx }));

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onPointerEnter={onPointerEnter}
    >
      {/* Sliding track */}
      <div
        className="absolute inset-0 flex transition-transform duration-300 ease-out"
        style={{
          width: hydrated ? `${total * 100}%` : "100%",
          transform: hydrated
            ? `translateX(-${(idx * 100) / total}%)`
            : "translateX(0)",
        }}
      >
        {renderList.map(({ m, i }) => (
          <div
            key={m.id}
            aria-hidden={i !== idx}
            className="relative h-full shrink-0"
            style={{ width: hydrated ? `${100 / total}%` : "100%" }}
          >
            <PropertyImage
              src={m.url}
              alt={m.alt_text || alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next — visible au hover sur desktop */}
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Photo précédente"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 inline-flex items-center justify-center bg-paper/90 text-ink rounded-full opacity-0 group-hover:opacity-100 hover:bg-paper transition-opacity shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Photo suivante"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 inline-flex items-center justify-center bg-paper/90 text-ink rounded-full opacity-0 group-hover:opacity-100 hover:bg-paper transition-opacity shadow-sm"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Dots — piste qui glisse si total > MAX_DOTS, dots hors fenêtre
              scale à 0 pour une disparition douce (plus de saut brusque) */}
          <div
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 overflow-hidden"
            style={{ width: viewportWidth }}
            role="tablist"
            aria-label="Photos"
          >
            <div
              className="flex items-center transition-transform duration-300 ease-out"
              style={{
                gap: DOT_GAP,
                width: trackWidth,
                transform: `translateX(-${dotStart * (DOT_WIDTH + DOT_GAP)}px)`,
              }}
            >
              {sorted.map((_, i) => {
                const inWindow = i >= dotStart && i < dotEnd;
                const isActive = i === idx;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Photo ${i + 1} sur ${total}`}
                    tabIndex={inWindow ? 0 : -1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goTo(i);
                    }}
                    className="shrink-0 group inline-flex items-center justify-center border-0 p-0 bg-transparent"
                    style={{ width: DOT_WIDTH, height: DOT_WIDTH }}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "block rounded-full transition-all duration-300 ease-out",
                        isActive
                          ? "bg-paper shadow-[0_0_4px_oklch(0_0_0/0.4)]"
                          : inWindow
                          ? "bg-paper/60 group-hover:bg-paper/85"
                          : "bg-paper/60",
                      )}
                      style={{
                        width: isActive ? DOT_WIDTH : DOT_WIDTH - 2,
                        height: isActive ? DOT_WIDTH : DOT_WIDTH - 2,
                        transform: inWindow ? "scale(1)" : "scale(0)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indicateur de position pour screen readers */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 sr-only">
            Photo {idx + 1} sur {total}
          </div>
        </>
      )}
    </div>
  );
}
