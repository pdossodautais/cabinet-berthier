import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";

export default function NotFound() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
      <div className="chapter-mark mb-8 animate-eyebrow-in">Nº 404 — Adresse inconnue</div>
      <h1
        className="h-display mb-6"
        style={{ fontSize: "clamp(48px, 8vw, 128px)", lineHeight: 0.95 }}
      >
        Cette adresse
        <br />
        n&apos;est pas{" "}
        <em className="h-italic" style={{ color: "var(--cobalt)" }}>
          sur nos plans.
        </em>
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
        La page que vous cherchez n&apos;existe pas — ou n&apos;existe plus.
        Peut-être un bien vendu, un lien qui a bougé, ou une URL fantaisiste.
      </p>
      <div className="pt-8 rule flex flex-wrap gap-4">
        <Link href="/biens" className="btn-ink">
          Voir le catalogue
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Retour à l&apos;accueil
        </Link>
      </div>
      <div
        className="mt-20 pt-8 rule flex flex-wrap items-baseline gap-x-8 gap-y-3 h-eyebrow"
        style={{
          color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
        }}
      >
        <span>Ou passez au Cabinet</span>
        <a
          href={`tel:${clientConfig.contact.phone.replace(/\s/g, "")}`}
          className="tabular hover:text-[color:var(--cobalt)] transition-colors"
          style={{ color: "var(--ink-raw)" }}
        >
          {clientConfig.contact.phone}
        </a>
        <span>·</span>
        <a
          href={`mailto:${clientConfig.contact.email}`}
          className="hover:text-[color:var(--cobalt)] transition-colors"
          style={{ color: "var(--ink-raw)" }}
        >
          {clientConfig.contact.email}
        </a>
      </div>
    </div>
  );
}
