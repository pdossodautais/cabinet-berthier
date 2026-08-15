import type { Metadata } from "next";
import { FavoritesContent } from "./favorites-content";
import { Reveal } from "@/components/reveal";
import { clientConfig } from "@repo/shared/client-config";

export const metadata: Metadata = {
  title: "Favoris",
  description: "Votre sélection de biens mise de côté.",
  alternates: { canonical: "/favoris" },
};

export default function FavoritesPage() {
  return (
    <div>
      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Favoris</div>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <Reveal kind="mask-y" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(48px, 7vw, 108px)" }}
            >
              Votre sélection
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                personnelle.
              </em>
            </h1>
          </Reveal>
          <Reveal kind="slide-up" delay={150} className="lg:col-span-5">
            <p
              className="text-[15px] leading-[1.7]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
              }}
            >
              Les biens que vous avez mis de côté. Sauvegardés dans votre
              navigateur — à partager avec votre conjoint, votre notaire, ou
              votre conseiller {clientConfig.agencyName}.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-28">
        <FavoritesContent />
      </section>
    </div>
  );
}
