"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui/dialog";
import { PropertyImage } from "@repo/ui/property-image";
import type { PropertyMedia } from "@repo/shared/supabase/types";
import { clientConfig } from "@repo/shared/client-config";
import { PropertyDetailActions } from "./property-detail-actions";
import { PropertyImagePlaceholder } from "./property-image-placeholder";

export function PropertyGallery({
  media,
  exclusive = false,
  propertyId,
  title,
  price,
  transactionType,
}: {
  media: PropertyMedia[];
  exclusive?: boolean;
  propertyId?: string;
  title?: string;
  price?: number;
  transactionType?: "vente" | "location";
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(
    null,
  );
  const panRef = useRef<{
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
  } | null>(null);

  const sorted = [...media].sort((a, b) => a.position - b.position);
  const total = sorted.length;

  // Reset zoom/translate à la fermeture. Le scroll-lock du body est géré
  // nativement par Radix Dialog — ne PAS le dupliquer manuellement via
  // `document.body.style.overflow`, ça cassait la restauration du scroll
  // après fermeture (le fix Radix remet l'overflow sur <html> et notre
  // nettoyage inline-style sur <body> créait un conflit qui figeait le scroll).
  useEffect(() => {
    if (!lightboxOpen) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }, [lightboxOpen]);

  function openAt(idx: number) {
    setCurrentIdx(idx);
    setLightboxOpen(true);
  }

  function resetZoom() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }
  const prev = useCallback(() => {
    resetZoom();
    setCurrentIdx((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);
  const next = useCallback(() => {
    resetZoom();
    setCurrentIdx((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, lightboxOpen]);

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      pinchRef.current = { startDist: dist, startScale: scale };
    } else if (e.touches.length === 1 && scale > 1) {
      panRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startTx: translate.x,
        startTy: translate.y,
      };
    }
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && pinchRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const newScale = Math.min(
        4,
        Math.max(1, pinchRef.current.startScale * (dist / pinchRef.current.startDist)),
      );
      setScale(newScale);
      if (newScale === 1) setTranslate({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && panRef.current && scale > 1) {
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      setTranslate({
        x: panRef.current.startTx + dx,
        y: panRef.current.startTy + dy,
      });
    }
  }
  function handleTouchEnd() {
    pinchRef.current = null;
    panRef.current = null;
  }
  function handleDoubleClick() {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }

  if (total === 0) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden border border-hairline">
        <PropertyImagePlaceholder variant="detail" />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <AdaptiveLayout
          sorted={sorted}
          total={total}
          exclusive={exclusive}
          openAt={openAt}
        />
        {propertyId && title && (
          <PropertyDetailActions
            propertyId={propertyId}
            title={title}
            price={price}
            transactionType={transactionType}
          />
        )}
      </div>

      {/* See all photos button (mobile + when nothing else fits) */}
      <button
        type="button"
        onClick={() => openAt(0)}
        className="md:hidden mt-3 inline-flex items-center gap-2 h-10 px-4 border border-hairline-strong text-ink text-[12px] hover:border-ink transition-colors"
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.3} />
        Voir les {total} photos
      </button>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="!fixed !top-0 !left-0 !translate-x-0 !translate-y-0 !max-w-none !w-[100vw] !h-[100dvh] !p-0 !bg-ink !border-none !rounded-none !gap-0 !ring-0"
        >
          <DialogTitle className="sr-only">Photo du bien</DialogTitle>
          <div className="relative flex items-center justify-center h-full">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Fermer"
              className="absolute top-4 right-4 z-20 w-11 h-11 inline-flex items-center justify-center bg-paper/10 text-paper hover:bg-paper/20 transition-colors backdrop-blur"
            >
              <X className="h-5 w-5" strokeWidth={1.3} />
            </button>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Photo précédente"
                  className="absolute top-1/2 -translate-y-1/2 left-4 z-20 w-11 h-11 inline-flex items-center justify-center bg-paper/10 text-paper hover:bg-paper/20 transition-colors backdrop-blur"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.3} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Photo suivante"
                  className="absolute top-1/2 -translate-y-1/2 right-4 z-20 w-11 h-11 inline-flex items-center justify-center bg-paper/10 text-paper hover:bg-paper/20 transition-colors backdrop-blur"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.3} />
                </button>
              </>
            )}
            <div
              aria-label="Image zoomable par pincement ou double-clic"
              className="relative w-full h-full touch-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              style={{
                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
              }}
            >
              <PropertyImage
                src={sorted[currentIdx].url}
                alt={sorted[currentIdx].alt_text || `Photo ${currentIdx + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 mono text-[12px] text-paper bg-paper/10 px-3 py-1.5 backdrop-blur">
              {String(currentIdx + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// — Layout adaptatif selon le nombre de photos disponibles —
function AdaptiveLayout({
  sorted,
  total,
  exclusive,
  openAt,
}: {
  sorted: PropertyMedia[];
  total: number;
  exclusive: boolean;
  openAt: (idx: number) => void;
}) {
  const exclusiveBadge = exclusive ? (
    <div className="absolute top-3 left-3 z-10 bg-paper text-ink px-3 py-1.5 text-[10px] font-medium tracking-[0.14em] uppercase pointer-events-none">
      Exclusivité {clientConfig.agencyName}
    </div>
  ) : null;

  // — 1 image : full width 16/9 —
  if (total === 1) {
    return (
      <Slot
        media={sorted[0]}
        idx={0}
        openAt={openAt}
        className="aspect-[16/9] md:aspect-[21/9] w-full"
        priority
        badge={exclusiveBadge}
      />
    );
  }

  // — 2 images : split 50/50 —
  if (total === 2) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:h-[420px] lg:h-[460px]">
        <Slot
          media={sorted[0]}
          idx={0}
          openAt={openAt}
          className="aspect-[4/3] sm:aspect-auto h-full"
          priority
          badge={exclusiveBadge}
        />
        <Slot
          media={sorted[1]}
          idx={1}
          openAt={openAt}
          className="aspect-[4/3] sm:aspect-auto h-full"
        />
      </div>
    );
  }

  // — 3 images : main + 2 stacked à droite —
  if (total === 3) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr] gap-2 md:h-[420px] lg:h-[460px]">
        <Slot
          media={sorted[0]}
          idx={0}
          openAt={openAt}
          className="col-span-2 md:col-span-1 aspect-[4/3] md:aspect-auto"
          priority
          badge={exclusiveBadge}
        />
        <div className="grid grid-rows-2 gap-2">
          <Slot
            media={sorted[1]}
            idx={1}
            openAt={openAt}
            className="aspect-[3/2] md:aspect-auto"
          />
          <Slot
            media={sorted[2]}
            idx={2}
            openAt={openAt}
            className="aspect-[3/2] md:aspect-auto"
          />
        </div>
      </div>
    );
  }

  // — 4 images : main + 2 stacked + 1 full —
  if (total === 4) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-2 md:h-[420px] lg:h-[460px]">
        <Slot
          media={sorted[0]}
          idx={0}
          openAt={openAt}
          className="col-span-2 md:col-span-1 aspect-[4/3] md:aspect-auto"
          priority
          badge={exclusiveBadge}
        />
        <div className="grid grid-rows-2 gap-2">
          <Slot
            media={sorted[1]}
            idx={1}
            openAt={openAt}
            className="aspect-[3/2] md:aspect-auto"
          />
          <Slot
            media={sorted[2]}
            idx={2}
            openAt={openAt}
            className="aspect-[3/2] md:aspect-auto"
          />
        </div>
        <Slot
          media={sorted[3]}
          idx={3}
          openAt={openAt}
          className="aspect-[3/4] md:aspect-auto md:h-full"
        />
      </div>
    );
  }

  // — 5+ images : main + 2 stacked + 2 stacked, overlay sur dernière si extra —
  const extra = Math.max(0, total - 5);

  return (
    <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-2 md:h-[420px] lg:h-[460px]">
      <Slot
        media={sorted[0]}
        idx={0}
        openAt={openAt}
        className="col-span-2 md:col-span-1 aspect-[4/3] md:aspect-auto"
        priority
        badge={exclusiveBadge}
      />
      <div className="grid grid-rows-2 gap-2">
        <Slot
          media={sorted[1]}
          idx={1}
          openAt={openAt}
          className="aspect-[3/2] md:aspect-auto"
        />
        <Slot
          media={sorted[2]}
          idx={2}
          openAt={openAt}
          className="aspect-[3/2] md:aspect-auto"
        />
      </div>
      <div className="grid grid-rows-2 gap-2">
        <Slot
          media={sorted[3]}
          idx={3}
          openAt={openAt}
          className="aspect-[3/2] md:aspect-auto"
        />
        <Slot
          media={sorted[4]}
          idx={4}
          openAt={openAt}
          className="aspect-[3/2] md:aspect-auto"
          overlay={
            extra > 0 ? (
              <div className="absolute inset-0 bg-ink/55 flex items-center justify-center text-paper pointer-events-none">
                <span className="text-[13px] font-medium tracking-[0.02em]">
                  + {extra} photo{extra > 1 ? "s" : ""}
                </span>
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}

function Slot({
  media,
  idx,
  openAt,
  className,
  priority,
  badge,
  overlay,
}: {
  media: PropertyMedia;
  idx: number;
  openAt: (idx: number) => void;
  className?: string;
  priority?: boolean;
  badge?: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => openAt(idx)}
      aria-label={`Voir la photo ${idx + 1}`}
      className={`relative bg-muted overflow-hidden group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink ${className ?? ""}`}
    >
      <PropertyImage
        src={media.url}
        alt={media.alt_text || `Photo ${idx + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
      {badge}
      {overlay}
    </button>
  );
}
