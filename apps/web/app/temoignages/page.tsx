import { getSettings, getTestimonials } from "@/lib/data";
import type { Metadata } from "next";
import { ExternalLink, Star } from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Témoignages",
  description: `Ce que nos clients disent de ${clientConfig.agencyFullName}.`,
  alternates: { canonical: "/temoignages" },
  openGraph: {
    title: `Témoignages · ${clientConfig.agencyFullName}`,
    description: "Ce que nos clients disent de l'agence.",
    type: "website",
    images: ["/opengraph-image"],
  },
};

const PARTNERS = [
  "Étude Trocadéro Notaires",
  "Chambre FNAIM Paris",
  "Barrault-Perrin Architectes",
  "SCP Klein & Associés",
];

export default async function TemoignagesPage() {
  const [testimonials, s] = await Promise.all([
    getTestimonials(),
    getSettings(),
  ]);

  const reviewUrl = s.google_reviews_url || clientConfig.reviews.url;
  const rating = parseFloat(s.agency_rating || String(clientConfig.reviews.rating)) || 5;
  const reviewCount =
    parseInt(s.agency_reviews_count || String(clientConfig.reviews.count), 10) || 0;

  // Pre-compute the integer + decimal portions of the rating so we can
  // animate the integer with <CountUp /> (which only supports integers).
  const ratingInt = Math.floor(rating);
  const ratingDecimal = Math.round((rating - ratingInt) * 10);

  type StatValue =
    | { kind: "text"; text: string }
    | { kind: "rating"; intValue: number; decimal: number }
    | { kind: "count"; value: number; suffix?: string };

  const stats: [StatValue, string][] = [
    [
      reviewCount > 0
        ? { kind: "rating", intValue: ratingInt, decimal: ratingDecimal }
        : { kind: "text", text: "À votre écoute" },
      reviewCount > 0
        ? `Note moyenne — ${reviewCount} avis`
        : "Une clientèle fidèle depuis " + clientConfig.foundedYear,
    ],
    [{ kind: "count", value: 96, suffix: "%" }, "Recommanderaient le Cabinet"],
    [{ kind: "count", value: 11, suffix: " sem." }, "Délai moyen de vente"],
    [{ kind: "count", value: 68, suffix: "%" }, "Biens vendus sur mandat exclusif"],
  ];

  return (
    <div>
      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Témoignages</div>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <Reveal kind="mask-y" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(48px, 7vw, 108px)" }}
            >
              Ils nous ont confié
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                leur adresse.
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
              Depuis {clientConfig.foundedYear}, {clientConfig.agencyName}{" "}
              accompagne propriétaires et acquéreurs dans le 16ᵉ
              arrondissement et rive droite. Quelques-unes de leurs voix.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats band */}
      <section
        style={{ background: "var(--ink-raw)", color: "var(--paper-raw)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16">
          <div
            className="grid sm:grid-cols-2 md:grid-cols-4 gap-px"
            style={{ background: "rgba(244,237,224,0.15)" }}
          >
            {stats.map(([v, l], i) => (
              <div
                key={i}
                className="py-10 px-8"
                style={{ background: "var(--ink-raw)" }}
              >
                <div
                  className="h-display tabular"
                  style={{ fontSize: "clamp(36px, 5vw, 56px)", color: "#d9c695" }}
                >
                  {v.kind === "text" && v.text}
                  {v.kind === "rating" && (
                    <>
                      <CountUp value={v.intValue} delay={i * 80} />
                      <span>{`,${v.decimal}/5`}</span>
                    </>
                  )}
                  {v.kind === "count" && (
                    <CountUp value={v.value} suffix={v.suffix} delay={i * 80} />
                  )}
                </div>
                <div
                  className="h-eyebrow mt-3"
                  style={{ color: "rgba(244,237,224,0.6)" }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20 pb-28">
        {testimonials.length > 0 ? (
          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: "var(--bone-raw)" }}
          >
            {testimonials.map((t, i) => {
              const staggerDelay = Math.min(i, 7) * 80;
              return (
                <Reveal key={t.id} kind="scale" delay={staggerDelay}>
                  <div
                    className="group p-8 lg:p-10 h-full card-lift card-cobalt-border relative"
                    style={{ background: "var(--paper-raw)" }}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div
                        className="flex gap-0.5"
                        style={{ color: "var(--gold-raw)" }}
                      >
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <div
                        className="h-eyebrow"
                        style={{
                          color:
                            "color-mix(in oklch, var(--ink-raw) 40%, transparent)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <p
                      className="h-italic"
                      style={{
                        fontSize: 19,
                        lineHeight: 1.45,
                        color: "var(--ink-raw)",
                      }}
                    >
                      « {t.content} »
                    </p>
                    <div className="mt-6 pt-5 rule">
                      <div className="h-small-caps">{t.name}</div>
                      <div
                        className="h-eyebrow mt-1"
                        style={{
                          color:
                            "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                        }}
                      >
                        {t.role}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal kind="slide-up">
            <div
              className="py-20 text-center"
              style={{ border: "1px solid var(--bone-raw)" }}
            >
              <div className="chapter-mark mb-4 justify-center inline-flex animate-eyebrow-in">
                À venir
              </div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
              >
                Le premier avis{" "}
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  sera le vôtre.
                </em>
              </h2>
            </div>
          </Reveal>
        )}

        {/* Partenaires */}
        <div
          className="mt-20 p-10"
          style={{
            background: "var(--ivory-raw)",
            border: "1px solid var(--bone-raw)",
          }}
        >
          <div className="h-eyebrow mb-6" style={{ color: "var(--cobalt)" }}>
            ¶ Partenaires &amp; confrères
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6 items-center">
            {PARTNERS.map((p) => (
              <div
                key={p}
                className="h-caps"
                style={{
                  fontSize: 13,
                  letterSpacing: "0.22em",
                  color:
                    "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {reviewUrl && (
          <div className="mt-24 pt-16 rule-ink">
            <div className="chapter-mark mb-8 animate-eyebrow-in">Nº 02 — Votre voix</div>

            <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 items-end">
              <div className="lg:col-span-7">
                <h2
                  className="h-display"
                  style={{
                    fontSize: "clamp(40px, 5.5vw, 84px)",
                    lineHeight: 0.98,
                  }}
                >
                  Et vous,
                  <br />
                  <em
                    className="h-italic"
                    style={{ color: "var(--cobalt)" }}
                  >
                    qu'en direz-vous ?
                  </em>
                </h2>
              </div>

              <div className="lg:col-span-5 lg:pb-3">
                <div
                  className="flex gap-1 mb-5"
                  style={{ color: "var(--gold-raw)" }}
                  aria-hidden="true"
                >
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p
                  className="text-[15px] leading-[1.75] max-w-[460px]"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                  }}
                >
                  Une ligne sincère de votre part aide notre prochain client
                  à se décider, et rappelle à l'équipe la considération que
                  mérite chaque dossier. Merci de prendre un instant.
                </p>

                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group btn-cobalt btn-fill-ink inline-flex items-center gap-2.5 mt-8"
                >
                  <span className="relative z-[1] inline-flex items-center gap-2.5">
                    Laisser un avis sur Google
                    <ExternalLink
                      className="h-3.5 w-3.5 group-arrow"
                      strokeWidth={1.5}
                    />
                  </span>
                </a>

                <div
                  className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  <span
                    className="mono text-[10px] tracking-[0.22em] uppercase"
                  >
                    Ou par courriel
                  </span>
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ background: "currentColor" }}
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${clientConfig.contact.email}`}
                    className="link-under text-[13px]"
                    style={{ color: "var(--ink-raw)" }}
                  >
                    {clientConfig.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
