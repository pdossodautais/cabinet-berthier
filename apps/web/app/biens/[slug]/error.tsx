"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/button";

export default function PropertyError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="chapter-mark mb-8 animate-eyebrow-in">Nº 00 — Erreur</div>
      <h1
        className="h-display mb-6"
        style={{ fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 1 }}
      >
        Ce bien nous{" "}
        <em className="h-italic" style={{ color: "var(--cobalt)" }}>
          échappe
        </em>
        ,<br />
        un instant.
      </h1>
      <p
        className="h-italic mb-10"
        style={{
          fontSize: 22,
          lineHeight: 1.45,
          color: "color-mix(in oklch, var(--ink-raw) 78%, transparent)",
          maxWidth: 640,
        }}
      >
        Un incident technique nous empêche d&apos;afficher cette annonce.
        Réessayez dans un instant — ou revenez au catalogue, nous en avons
        d&apos;autres à vous montrer.
      </p>
      <div className="pt-8 rule flex flex-wrap gap-4">
        <Button
          onClick={reset}
          type="button"
          variant="ghost"
          className="btn-ink h-auto"
        >
          Réessayer
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
        <Link href="/biens" className="btn-ghost">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Retour au catalogue
        </Link>
      </div>
    </div>
  );
}
