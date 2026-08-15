"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  delay?: number;
  padStart?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Anime un compteur de 0 vers `value` quand l'élément entre dans le viewport.
 * Easing ease-out-quart : départ rapide, freinage marqué (premium feel).
 * Respecte `prefers-reduced-motion`. Le useEffect ne se ré-exécute jamais
 * (deps vides) — les props live sont lues via une ref pour garder
 * l'animation stable même si le parent re-render.
 */
export function CountUp({
  value,
  duration = 1400,
  delay = 0,
  padStart = 0,
  prefix = "",
  suffix = "",
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);

  // Lire les props live au moment où l'animation démarre, sans réinitialiser
  // le useEffect quand elles changent.
  const propsRef = useRef({ value, duration, delay });
  propsRef.current = { value, duration, delay };

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(propsRef.current.value);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const { value: v, duration: d, delay: dl } = propsRef.current;
      const startAt = performance.now() + dl;
      const tick = (now: number) => {
        const t = Math.max(0, now - startAt);
        const p = Math.min(1, t / d);
        const eased = easeOutQuart(p);
        setDisplay(Math.round(v * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const node = ref.current;
    if (!node) {
      // Pas de ref encore (rare avec useEffect, mais safe-guard) — anime
      // quand même au mount immédiat.
      run();
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }

    // Si déjà visible au mount, lance directement.
    const rect = node.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight && rect.bottom > 0;

    if (inViewport) {
      run();
      return () => {
        if (raf) cancelAnimationFrame(raf);
      };
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          obs.disconnect();
          run();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );
    obs.observe(node);
    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const text =
    padStart > 0 ? String(display).padStart(padStart, "0") : String(display);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
