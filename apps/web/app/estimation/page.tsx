import type { Metadata } from "next";
import { clientConfig } from "@repo/shared/client-config";
import { EstimationWizard } from "@/components/estimation-wizard";
import { Reveal } from "@/components/reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Estimation gratuite",
  description:
    "Obtenez une estimation personnalisée de votre bien en quelques minutes.",
  alternates: { canonical: "/estimation" },
  openGraph: {
    title: `Estimation gratuite · ${clientConfig.agencyFullName}`,
    description:
      "Obtenez une estimation personnalisée de votre bien en quelques minutes.",
    type: "website",
    images: ["/opengraph-image"],
  },
};

export default function EstimationPage() {
  return (
    <div>
      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Estimation gratuite</div>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <Reveal kind="mask-y" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(48px, 7vw, 108px)" }}
            >
              Connaître
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                la valeur juste.
              </em>
            </h1>
          </Reveal>
          <Reveal kind="slide-up" delay={200} className="lg:col-span-5">
            <p
              className="text-[15px] leading-[1.7]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
              }}
            >
              Réponse personnalisée sous 72 heures par Julien Berthier — après une
              visite de votre bien, gratuite et sans engagement.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Wizard */}
      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 pb-28">
        <EstimationWizard />
      </section>
    </div>
  );
}
