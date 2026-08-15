"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import { clientConfig } from "@repo/shared/client-config";
import { AddressLink } from "@/components/address-link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="chapter-mark mb-8 animate-eyebrow-in">Nº 00 — Incident</div>
      <h1
        className="h-display mb-6"
        style={{ fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 1 }}
      >
        Une{" "}
        <em className="h-italic" style={{ color: "var(--cobalt)" }}>
          contrariété
        </em>
        ,<br />
        rien de plus.
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
        Quelque chose s&apos;est mal passé de notre côté. Réessayez dans un
        instant, et si le problème persiste, passez nous voir au{" "}
        <AddressLink
          address={clientConfig.contact.addressShort}
          city="Paris"
          postalCode="75116"
          href={clientConfig.contact.mapsUrl}
          unstyled
          className="hover:text-[color:var(--cobalt)] transition-colors"
        >
          <span style={{ color: "var(--ink-raw)" }}>
            {clientConfig.contact.addressShort}
          </span>
        </AddressLink>
        .
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
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
