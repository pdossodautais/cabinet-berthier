"use client";

import { useEffect, useRef, useState } from "react";

type RevealKind =
  /** Slide up + fade (default). 32px de translate, généreux. */
  | "slide-up"
  /** Slide depuis la droite — pour aside/cartouche. */
  | "slide-left"
  /** Slide depuis la gauche — pour images/photos. */
  | "slide-right"
  /** Scale subtil (0.96 → 1) + fade — pour cards et tuiles. */
  | "scale"
  /** Image que l'on découvre via clip-path horizontal — édito magazine. */
  | "clip-x"
  /** « Rideau qui se lève » : le contenu glisse depuis le bas, masqué par
   *  son container (overflow:hidden). Effet magazine premium pour titres. */
  | "mask-y";

type Props = {
  children: React.ReactNode;
  /** Type d'apparition (visuel). Défaut : slide-up. */
  kind?: RevealKind;
  /** Délai avant le départ de l'animation, en ms (utile pour stagger). */
  delay?: number;
  /** Durée de l'animation en ms. Défaut 900ms (ease-out-quart). */
  duration?: number;
  /** Élément HTML rendu (div par défaut). */
  as?: React.ElementType;
  className?: string;
};

const HIDDEN_STYLES: Record<Exclude<RevealKind, "mask-y">, string> = {
  "slide-up": "opacity-0 translate-y-8",
  "slide-left": "opacity-0 translate-x-10",
  "slide-right": "opacity-0 -translate-x-10",
  scale: "opacity-0 scale-[0.96]",
  "clip-x": "opacity-100 [clip-path:inset(0_100%_0_0)]",
};

const VISIBLE_STYLES: Record<Exclude<RevealKind, "mask-y">, string> = {
  "slide-up": "opacity-100 translate-y-0",
  "slide-left": "opacity-100 translate-x-0",
  "slide-right": "opacity-100 translate-x-0",
  scale: "opacity-100 scale-100",
  "clip-x": "opacity-100 [clip-path:inset(0_0_0_0)]",
};

/**
 * Wrapper d'apparition au scroll. Utilise un easing premium (ease-out-quart)
 * pour rendu plus élégant qu'un simple fondu : slide vertical, slide horizontal,
 * scale, ou reveal par clip-path. Respecte `prefers-reduced-motion` (apparition
 * immédiate, pas de mouvement).
 */
export function Reveal({
  children,
  kind = "slide-up",
  delay = 0,
  duration = 900,
  as: As = "div",
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    let timeoutId: number | undefined;
    let frame1: number | undefined;
    let frame2: number | undefined;

    // Trigger : double rAF garantit que le navigateur peint l'état initial
    // (caché) AVANT que React ne commit l'état visible — sans ça, les deux
    // états peuvent être squashés dans la même frame et la transition CSS
    // ne se voit jamais.
    const trigger = () => {
      timeoutId = window.setTimeout(() => {
        frame1 = requestAnimationFrame(() => {
          frame2 = requestAnimationFrame(() => setVisible(true));
        });
      }, delay);
    };

    // Si l'élément est déjà visible dans le viewport au mount (typiquement
    // un hero above-the-fold), on déclenche l'animation tout de suite.
    // Sans ça, l'IntersectionObserver peut rapporter isIntersecting=false
    // au callback initial puis ne plus refire — l'élément reste caché.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      trigger();
      return () => {
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        if (frame1 !== undefined) cancelAnimationFrame(frame1);
        if (frame2 !== undefined) cancelAnimationFrame(frame2);
      };
    }

    // Fallback scroll/resize : quand l'IO est capricieux (cas tordus de
    // restoration de scroll après F5, layouts dynamiques, etc.), on garantit
    // que dès que l'élément touche le viewport, l'animation se déclenche.
    let scrollHandler: (() => void) | null = null;
    const checkVisible = () => {
      const r = node.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        trigger();
        if (scrollHandler) {
          window.removeEventListener("scroll", scrollHandler, true);
          window.removeEventListener("resize", scrollHandler);
        }
        obs.disconnect();
      }
    };

    // threshold: 0 + pas de rootMargin négatif — fire dès qu'un seul pixel
    // de l'élément touche le viewport. Plus robuste que 0.12 + rootMargin
    // pour les éléments qui rentrent par le haut (scroll up depuis bottom).
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trigger();
          obs.disconnect();
          if (scrollHandler) {
            window.removeEventListener("scroll", scrollHandler, true);
            window.removeEventListener("resize", scrollHandler);
          }
        }
      },
      { threshold: 0 },
    );
    obs.observe(node);

    scrollHandler = () => checkVisible();
    window.addEventListener("scroll", scrollHandler, { passive: true, capture: true });
    window.addEventListener("resize", scrollHandler, { passive: true });

    return () => {
      obs.disconnect();
      if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler, true);
        window.removeEventListener("resize", scrollHandler);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (frame1 !== undefined) cancelAnimationFrame(frame1);
      if (frame2 !== undefined) cancelAnimationFrame(frame2);
    };
  }, [delay]);

  // Easing « ease-out-quart » (Penner) — sortie plus marquée qu'ease-out
  // standard, sensation premium / éditoriale.
  const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

  // « Rideau qui se lève » : container overflow-hidden, le contenu glisse
  // depuis le bas (translateY 110% → 0). Effet de masque éditorial premium —
  // bien plus visible et plus classe qu'une simple animation clip-path.
  if (kind === "mask-y") {
    return (
      <As
        ref={ref}
        className={"overflow-hidden block" + (className ? " " + className : "")}
      >
        <div
          className="block will-change-transform"
          style={{
            transform: visible ? "translateY(0)" : "translateY(110%)",
            transition: `transform ${duration}ms ${easing}`,
          }}
        >
          {children}
        </div>
      </As>
    );
  }

  return (
    <As
      ref={ref}
      className={
        "will-change-[opacity,transform,clip-path] " +
        (visible ? VISIBLE_STYLES[kind] : HIDDEN_STYLES[kind]) +
        (className ? " " + className : "")
      }
      style={{
        transitionProperty: "opacity, transform, clip-path",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: easing,
      }}
    >
      {children}
    </As>
  );
}
