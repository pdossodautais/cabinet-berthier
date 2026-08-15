import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Honoraires",
  description:
    "Barème des honoraires en vigueur — vente, location et gestion immobilière. Affichage conforme à l'arrêté du 10 janvier 2017.",
  alternates: { canonical: "/honoraires" },
  openGraph: {
    title: `Honoraires · ${clientConfig.agencyFullName}`,
    description:
      "Barème vente, location et gestion — conforme à l'arrêté du 10 janvier 2017.",
    type: "website",
    images: ["/opengraph-image"],
  },
};

const VENTE = [
  { range: "Jusqu'à 500 000 €", rate: "5 %", min: "TTC" },
  { range: "De 500 001 € à 1 000 000 €", rate: "4,5 %", min: "TTC" },
  { range: "De 1 000 001 € à 3 000 000 €", rate: "4 %", min: "TTC" },
  { range: "De 3 000 001 € à 5 000 000 €", rate: "3,5 %", min: "TTC" },
  { range: "Au-delà de 5 000 000 €", rate: "3 %", min: "TTC" },
];

const LOCATION = [
  {
    t: "Honoraires locataire",
    p: "12 € TTC/m²",
    sub: "Visite, constitution du dossier, rédaction du bail",
  },
  {
    t: "État des lieux",
    p: "3 € TTC/m²",
    sub: "Uniquement si réalisé par le Cabinet",
  },
  {
    t: "Honoraires bailleur",
    p: "12 € TTC/m²",
    sub: "Identique au locataire sur mandat classique",
  },
  {
    t: "Mandat exclusif bailleur",
    p: "1 mois de loyer",
    sub: "Forfait — location meublée ou vide",
  },
];

const GESTION = [
  {
    t: "Gestion standard",
    rate: 6,
    sub: "sur loyers encaissés + charges",
    items: [
      "Encaissement des loyers",
      "Révision annuelle",
      "Relances impayés",
    ],
  },
  {
    t: "Gestion complète",
    rate: 8,
    sub: "sur loyers encaissés + charges",
    items: [
      "Toutes prestations standard",
      "Gestion technique & travaux",
      "Assurance loyers impayés",
    ],
  },
  {
    t: "Gestion premium",
    rate: 10,
    sub: "sur loyers encaissés + charges",
    items: [
      "Toutes prestations complètes",
      "Conciergerie",
      "Optimisation fiscale",
    ],
  },
];

export default function HonorairesPage() {
  return (
    <div>
      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Honoraires &amp; barème</div>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <Reveal kind="mask-y" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(48px, 7vw, 108px)" }}
            >
              Nos
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                honoraires.
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
              Barème en vigueur au 1ᵉʳ janvier {new Date().getFullYear()}.
              Affichage conforme à l&apos;arrêté du 10 janvier 2017 relatif aux
              obligations d&apos;information sur les prix des prestations de
              transaction et de gestion immobilière.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 pb-28">
        {/* Vente */}
        <div className="mb-20">
          <div className="chapter-mark mb-4 animate-eyebrow-in">Nº 02 — Vente</div>
          <Reveal kind="slide-up">
            <h2
              className="h-display mb-6"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
            >
              Barème{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                Vente.
              </em>
            </h2>
          </Reveal>
          <Reveal kind="slide-up" delay={100}>
            <p
              className="text-[14px] mb-8 max-w-[640px]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
              }}
            >
              Honoraires TTC calculés sur le prix net vendeur. À la charge de
              l&apos;acquéreur sauf mention contraire au mandat. Réduction de
              0,5 % sur mandat exclusif.
            </p>
          </Reveal>
          <Reveal kind="slide-up" delay={150}>
            <div style={{ border: "1px solid var(--ink-raw)" }}>
              <div
                className="grid grid-cols-2 py-4 px-6 h-small-caps"
                style={{
                  background: "var(--ink-raw)",
                  color: "var(--paper-raw)",
                }}
              >
                <div>Tranche de prix</div>
                <div className="text-right">Honoraires TTC</div>
              </div>
              {VENTE.map((h, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 py-5 px-6 items-center transition-colors hover:bg-[color-mix(in_oklch,var(--cobalt)_4%,transparent)]"
                  style={{
                    borderTop:
                      i > 0 ? "1px solid var(--bone-raw)" : "none",
                    background:
                      i % 2 ? "var(--ivory-raw)" : "var(--paper-raw)",
                  }}
                >
                  <div className="text-[15px]">{h.range}</div>
                  <div
                    className="text-right h-display tabular"
                    style={{ fontSize: 28, color: "var(--cobalt)" }}
                  >
                    {h.rate}{" "}
                    <span
                      className="mono text-[11px]"
                      style={{
                        color:
                          "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                      }}
                    >
                      {h.min}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Location */}
        <div className="mb-20">
          <div className="chapter-mark mb-4 animate-eyebrow-in">Nº 03 — Location</div>
          <Reveal kind="slide-up">
            <h2
              className="h-display mb-6"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
            >
              Barème{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                Location.
              </em>
            </h2>
          </Reveal>
          <Reveal kind="slide-up" delay={100}>
            <p
              className="text-[14px] mb-8 max-w-[640px]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
              }}
            >
              Honoraires conformes à la loi ALUR, plafonnés par décret selon la
              zone. Paris est classé en zone très tendue (12 € TTC/m² de surface
              habitable).
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            {LOCATION.map((l, i) => (
              <Reveal key={i} kind="scale" delay={i * 80}>
                <div
                  className="card-lift card-cobalt-border p-6 h-full"
                  style={{
                    border: "1px solid var(--bone-raw)",
                    background: "var(--paper-raw)",
                  }}
                >
                  <div
                    className="h-eyebrow mb-3"
                    style={{ color: "var(--cobalt)" }}
                  >
                    {l.t}
                  </div>
                  <div
                    className="h-display tabular mb-2"
                    style={{ fontSize: 36, color: "var(--ink-raw)" }}
                  >
                    {l.p}
                  </div>
                  <div
                    className="text-[13px]"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                    }}
                  >
                    {l.sub}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Gestion */}
        <div className="mb-20">
          <div className="chapter-mark mb-4 animate-eyebrow-in">Nº 04 — Gestion locative</div>
          <Reveal kind="slide-up">
            <h2
              className="h-display mb-6"
              style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
            >
              Barème{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                Gestion.
              </em>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {GESTION.map((g, i) => (
              <Reveal key={g.t} kind="scale" delay={i * 80}>
                <div
                  className="card-lift card-cobalt-border p-8 h-full"
                  style={{
                    background: "var(--ivory-raw)",
                    border: "1px solid var(--bone-raw)",
                  }}
                >
                  <div
                    className="h-caps mb-5"
                    style={{ fontSize: 14, letterSpacing: "0.28em" }}
                  >
                    {g.t}
                  </div>
                  <div
                    className="h-display tabular"
                    style={{
                      fontSize: 52,
                      color: "var(--cobalt)",
                      lineHeight: 1,
                    }}
                  >
                    <CountUp value={g.rate} suffix=" % TTC" />
                  </div>
                  <div
                    className="h-eyebrow mt-2 mb-6"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    {g.sub}
                  </div>
                  <ul className="space-y-2 text-[13px]">
                    {g.items.map((it, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2"
                        style={{
                          color:
                            "color-mix(in oklch, var(--ink-raw) 75%, transparent)",
                        }}
                      >
                        <Check
                          className="h-3.5 w-3.5 shrink-0 mt-0.5"
                          strokeWidth={1.5}
                          style={{ color: "var(--cobalt)" }}
                        />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* À savoir */}
        <Reveal kind="slide-up">
          <div
            className="p-8"
            style={{
              background: "var(--ink-raw)",
              color: "var(--paper-raw)",
            }}
          >
            <div className="h-eyebrow mb-4" style={{ color: "#d9c695" }}>
              ¶ À savoir
            </div>
            <p
              className="text-[14px] leading-[1.7] max-w-[760px]"
              style={{ color: "rgba(244,237,224,0.85)" }}
            >
              Les montants indiqués sont TTC au taux de TVA en vigueur (20 %). Ce
              barème est susceptible de révision annuelle. Pour toute prestation
              non listée, un devis personnalisé est remis avant engagement.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="btn-shimmer relative overflow-hidden inline-flex items-center gap-3 px-5 py-3 text-[12px] uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
                style={{
                  background: "var(--paper-raw)",
                  color: "var(--ink-raw)",
                }}
              >
                Demander un devis personnalisé
              </Link>
              <Link
                href="/estimation"
                className="inline-flex items-center gap-3 px-5 py-3 text-[12px] uppercase tracking-[0.2em] transition-colors hover:bg-[rgba(244,237,224,0.08)]"
                style={{
                  border: "1px solid rgba(244,237,224,0.25)",
                  color: "var(--paper-raw)",
                }}
              >
                Estimer mon bien
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
