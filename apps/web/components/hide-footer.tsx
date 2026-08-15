"use client";

import { useEffect } from "react";

/**
 * Toggle la classe `is-app-mode` sur <body> tant que ce composant est monté.
 * → masque le footer global du root layout (cf. globals.css).
 *
 * À utiliser sur les pages "app" (catalogue, carte) où le footer marketing
 * complet n'a pas sa place.
 */
export function HideFooter() {
  useEffect(() => {
    document.body.classList.add("is-app-mode");
    return () => {
      document.body.classList.remove("is-app-mode");
    };
  }, []);
  return null;
}
