"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Link2,
  Check,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PropertyImage } from "@repo/ui/property-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import type { PropertyMedia } from "@repo/shared/supabase/types";
import { useFavorites } from "@/lib/use-favorites";
import { FacebookIcon } from "./social-icons";

// Fallback copy via hidden textarea + execCommand — utilisé quand
// navigator.clipboard n'est pas disponible (vieux navigateurs, contexte
// non-HTTPS, iframe sans Permission-Policy).
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

const PLACEHOLDER_PALETTES = [
  "p-warm",
  "p-cool",
  "p-night",
  "p-dusk",
  "p-stone",
  "p-roof",
];

export function PropertyGalleryEditorial({
  media,
  propertyId,
  title,
  transactionType,
}: {
  media: PropertyMedia[];
  propertyId: string;
  title: string;
  transactionType: "vente" | "location";
}) {
  const sorted = [...media].sort((a, b) => a.position - b.position);
  const slots = sorted.length > 0 ? sorted : [];
  const total = slots.length;

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  // Détecte tactile + Web Share API → sur mobile, Cliquer "Partager" ouvre le
  // sheet de partage natif (Messages, WhatsApp, AirDrop…) plutôt que le
  // dropdown desktop (qui n'a aucune chance de battre le sheet OS natif).
  const [useNativeShare, setUseNativeShare] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { favorites, toggle: toggleFav } = useFavorites();
  const isFav = favorites.includes(propertyId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;
    setUseNativeShare(isTouch && typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const hero = slots[activeIdx];
  // Si plus de 5 photos : on n'affiche que 4 thumbnails + 1 cellule "+N photos"
  // pour que tout tienne dans une seule rangée de la grille (grid-cols-5).
  // Sinon on affiche jusqu'à 5 thumbnails.
  const thumbs = slots.slice(0, total > 5 ? 4 : 5);
  const remaining = total - thumbs.length;

  const prev = useCallback(() => {
    setActiveIdx((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);
  const next = useCallback(() => {
    setActiveIdx((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightboxOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, prev, next]);

  const triggerNativeShare = async () => {
    if (typeof window === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title, url: window.location.href });
    } catch (err) {
      // Annulation utilisateur — pas de feedback bruyant
      if ((err as DOMException)?.name === "AbortError") return;
    }
  };

  const shareByEmail = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title} — ${url}`)}`;
  };

  const shareOnFacebook = () => {
    if (typeof window === "undefined") return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "width=600,height=400,noopener,noreferrer",
    );
  };

  const shareOnWhatsApp = () => {
    if (typeof window === "undefined") return;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${window.location.href}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const shareOnTwitter = () => {
    if (typeof window === "undefined") return;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const copyLink = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        ok = true;
      } else {
        ok = legacyCopy(url);
      }
    } catch {
      ok = legacyCopy(url);
    }
    if (!ok) {
      toast.error("Impossible de copier le lien");
      return;
    }
    setCopied(true);
    toast.success("Lien copié");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  if (total === 0) {
    return (
      <div>
        <div
          className={`placeholder-photo ${PLACEHOLDER_PALETTES[0]} relative overflow-hidden`}
          style={{ aspectRatio: "16 / 10" }}
          data-label="Aucune photo"
        >
          <Badge transactionType={transactionType} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Hero */}
        <div
          className="relative overflow-hidden group"
          style={{ aspectRatio: "16 / 10", background: "var(--ivory-raw)" }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 w-full h-full cursor-zoom-in"
            aria-label="Agrandir la photo"
          >
            {hero && (
              <PropertyImage
                src={hero.url}
                alt={hero.alt_text || title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            )}
          </button>

          {/* Badge top-left */}
          <Badge transactionType={transactionType} />

          {/* Action buttons top-right */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              type="button"
              onClick={() => toggleFav(propertyId)}
              className="h-11 w-11 flex items-center justify-center transition-colors hover:bg-[color:var(--ivory-raw)]"
              style={{
                background: "var(--paper-raw)",
                color: isFav ? "var(--cobalt)" : "var(--ink-raw)",
                border: "1px solid var(--bone-raw)",
              }}
              aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart
                className="h-4 w-4"
                strokeWidth={1.5}
                fill={isFav ? "currentColor" : "none"}
              />
            </button>
            {useNativeShare ? (
              <button
                type="button"
                onClick={triggerNativeShare}
                aria-label="Partager"
                className="h-11 w-11 flex items-center justify-center transition-colors hover:bg-[color:var(--ivory-raw)]"
                style={{
                  background: "var(--paper-raw)",
                  color: "var(--ink-raw)",
                  border: "1px solid var(--bone-raw)",
                }}
              >
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Partager"
                      className="h-11 w-11 flex items-center justify-center transition-colors hover:bg-[color:var(--ivory-raw)]"
                      style={{
                        background: "var(--paper-raw)",
                        color: "var(--ink-raw)",
                        border: "1px solid var(--bone-raw)",
                      }}
                    />
                  }
                >
                  <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-hairline-strong bg-paper min-w-[200px]"
                >
                  <DropdownMenuItem onClick={copyLink} className="text-[13px] gap-2.5">
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-ok" strokeWidth={1.4} />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" strokeWidth={1.4} />
                    )}
                    {copied ? "Lien copié" : "Copier le lien"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-hairline" />
                  <DropdownMenuItem
                    onClick={shareOnTwitter}
                    className="text-[13px] gap-2.5"
                  >
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.4} />
                    Twitter / X
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={shareOnFacebook}
                    className="text-[13px] gap-2.5"
                  >
                    <FacebookIcon width={14} height={14} />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={shareOnWhatsApp}
                    className="text-[13px] gap-2.5"
                  >
                    <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.4} />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={shareByEmail}
                    className="text-[13px] gap-2.5"
                  >
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.4} />
                    Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Counter bottom-right */}
          <div
            className="absolute bottom-4 right-4 px-3 py-1.5 mono text-[10px] tracking-[0.22em] uppercase tabular"
            style={{
              background: "rgba(11, 16, 32, 0.85)",
              color: "var(--paper-raw)",
            }}
          >
            {String(activeIdx + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </div>

          {/* Prev/Next arrows (apparaissent au hover sur desktop) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Photo précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
                style={{
                  background: "var(--paper-raw)",
                  color: "var(--ink-raw)",
                  border: "1px solid var(--bone-raw)",
                }}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Photo suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
                style={{
                  background: "var(--paper-raw)",
                  color: "var(--ink-raw)",
                  border: "1px solid var(--bone-raw)",
                }}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {thumbs.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-3">
            {thumbs.map((t, i) => {
              const active = i === activeIdx;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveIdx(i);
                    setLightboxOpen(true);
                  }}
                  aria-label={`Voir la photo ${i + 1} en grand`}
                  aria-current={active}
                  className="relative overflow-hidden transition-opacity cursor-zoom-in"
                  style={{
                    aspectRatio: "4 / 3",
                    opacity: active ? 1 : 0.55,
                    outline: active ? "2px solid var(--cobalt)" : "none",
                    outlineOffset: 0,
                  }}
                >
                  <PropertyImage
                    src={t.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 20vw, 160px"
                  />
                </button>
              );
            })}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="relative flex items-center justify-center mono text-[11px] tracking-[0.18em] uppercase tabular"
                style={{
                  aspectRatio: "4 / 3",
                  background: "var(--ink-raw)",
                  color: "var(--paper-raw)",
                }}
              >
                +{remaining} photos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lightbox — rendu via Portal sur document.body pour échapper aux
          containing blocks établis par les ancêtres avec `transform`
          (animation `view-swap` / `fade-in`). Sans portal, `fixed inset-0`
          serait limité au conteneur animé et le lightbox ne couvrirait pas
          tout l'écran. */}
      {lightboxOpen && hero && portalTarget &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galerie plein écran"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(11, 16, 32, 0.95)" }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 h-11 w-11 flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "var(--paper-raw)",
            }}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "var(--paper-raw)",
            }}
            aria-label="Précédente"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "var(--paper-raw)",
            }}
            aria-label="Suivante"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div
            className="relative w-full max-w-[1200px] mx-6"
            style={{ aspectRatio: "16 / 10" }}
            onClick={(e) => e.stopPropagation()}
          >
            <PropertyImage
              src={hero.url}
              alt={hero.alt_text || title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 mono text-[11px] tracking-[0.22em] uppercase tabular"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "var(--paper-raw)",
            }}
          >
            {String(activeIdx + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </div>
        </div>,
        portalTarget,
      )}
    </>
  );
}

function Badge({
  transactionType,
}: {
  transactionType: "vente" | "location";
}) {
  return (
    <div
      className="absolute top-4 left-4 px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase z-10 mono"
      style={{ background: "var(--cobalt)", color: "white" }}
    >
      {transactionType === "vente" ? "À vendre" : "À louer"}
    </div>
  );
}
