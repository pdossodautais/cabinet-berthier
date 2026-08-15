import {
  getFeaturedProperties,
  getLatestProperties,
  getSettings,
  getTestimonials,
  getBlogPosts,
  getAboutData,
} from "@/lib/data";
import { createClient } from "@repo/shared/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, Phone, Clock, Check, Star } from "lucide-react";
import { PropertyCardMagazine } from "@/components/property-card-magazine";
import { RecentlyViewed } from "@/components/recently-viewed";
import { AddressLink } from "@/components/address-link";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { clientConfig } from "@repo/shared/client-config";

function parseParisArrond(postal: string | null | undefined): string | null {
  if (!postal) return null;
  const m = /^750?(\d{1,2})$/.exec(postal.trim());
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 20) return null;
  return n === 1 ? "1ᵉʳ" : `${n}ᵉ`;
}

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: `${clientConfig.agencyFullName} — ${clientConfig.city}`,
    description: clientConfig.description,
    type: "website",
  },
};

const SERVICES = [
  {
    num: "01",
    title: "Vente",
    lede: "Transactions 500 k€ à 20 M€ — appartements haussmanniens, hôtels particuliers, biens d'exception.",
    items: [
      "Mandat exclusif · 3 à 5 %",
      "Estimation offerte sous 72h",
      "Mise en valeur photo & dossier",
      "Acquéreurs pré-qualifiés",
    ],
    lead: "Julien Berthier",
  },
  {
    num: "02",
    title: "Location",
    lede: "Un catalogue actif de biens résidentiels, bureaux et commerces dans Paris intra-muros.",
    items: [
      "Meublé ou vide · courte ou longue durée",
      "Dossier locataire sécurisé",
      "État des lieux détaillé",
      "Assurance loyers impayés",
    ],
    lead: "Julien Berthier",
  },
  {
    num: "03",
    title: "Gestion",
    lede: "Gestion locative pour propriétaires bailleurs — particuliers et institutionnels.",
    items: [
      "Encaissement des loyers",
      "Suivi technique & travaux",
      "Gestion comptable et fiscale",
      "Compte-rendu mensuel détaillé",
    ],
    lead: "Julien Berthier",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const [featured, latest, s, testimonials, posts, about, postalRes] =
    await Promise.all([
      getFeaturedProperties(),
      getLatestProperties(),
      getSettings(),
      getTestimonials(),
      getBlogPosts(),
      getAboutData(),
      supabase
        .from("properties")
        .select("postal_code")
        .eq("is_published", true),
    ]);

  // Répartition par arrondissement (Paris uniquement)
  const arrondCount = new Map<string, number>();
  (postalRes.data as { postal_code: string | null }[] | null)?.forEach(
    (row) => {
      const code = parseParisArrond(row.postal_code);
      if (code) arrondCount.set(code, (arrondCount.get(code) || 0) + 1);
    },
  );
  const arrondissements = Array.from(arrondCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({
      code,
      label: `Paris ${code}`,
      count,
      highlight: code === clientConfig.logoSubtitle.replace(/^Paris\s+/i, ""),
    }));

  const agencyName = s.agency_name || clientConfig.agencyFullName;
  const description = s.agency_description || clientConfig.description;
  const totalCount = about.saleCount + about.rentCount;
  const yearsExperience = new Date().getFullYear() - clientConfig.foundedYear;

  // Compose 6 biens pour la scrollbox (featured + latest sans doublons)
  const featuredIds = new Set(featured.map((p) => p.id));
  const heroProperties = [
    ...featured,
    ...latest.filter((p) => !featuredIds.has(p.id)),
  ].slice(0, 6);

  const stats: { value: number; label: string }[] = [
    { value: totalCount, label: "Biens au catalogue" },
    { value: about.saleCount, label: "Ventes en cours" },
    { value: about.rentCount, label: "Locations actives" },
    { value: yearsExperience, label: "Années d'expertise" },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            name: agencyName,
            description,
            ...(s.agency_address && {
              address: {
                "@type": "PostalAddress",
                streetAddress: s.agency_address,
              },
            }),
            ...(s.agency_phone && { telephone: s.agency_phone }),
            ...(s.agency_email && { email: s.agency_email }),
            ...(process.env.NEXT_PUBLIC_SITE_URL && {
              url: process.env.NEXT_PUBLIC_SITE_URL,
            }),
          }),
        }}
      />

      {/* ──────────────── HERO ──────────────── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-7">
            <div className="chapter-mark mb-10 animate-eyebrow-in">Nº 01 — Le Cabinet</div>
            <Reveal kind="mask-y" duration={1100}>
              <h1
                className="h-display"
                style={{ fontSize: "clamp(56px, 9vw, 136px)" }}
              >
                L&apos;art de
                <br />
                l&apos;adresse
                <br />
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  parisienne.
                </em>
              </h1>
            </Reveal>
            <Reveal kind="slide-up" delay={200}>
              <div className="mt-10 max-w-[520px]">
                <p
                  className="text-[17px] leading-[1.65]"
                  style={{
                    color: "color-mix(in oklch, var(--ink-raw) 78%, transparent)",
                  }}
                >
                  Depuis {clientConfig.foundedYear}, {clientConfig.agencyName}{" "}
                  accompagne propriétaires et acquéreurs dans les plus beaux
                  immeubles haussmanniens du {clientConfig.logoSubtitle}.{" "}
                  <em className="h-italic">Vente, location, gestion —</em> un
                  cabinet indépendant, une adresse, une clientèle.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <Link href="/biens" className="btn-ink btn-shimmer group">
                    Découvrir les biens
                    <ArrowRight
                      className="h-3.5 w-3.5 group-arrow"
                      strokeWidth={1.5}
                    />
                  </Link>
                  <Link
                    href="/estimation"
                    className="link-under group"
                    style={{ color: "var(--ink-raw)" }}
                  >
                    <span className="link-underline-anim">Estimer mon bien gratuitement</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <Reveal kind="clip-x" delay={300} duration={1100}>
                <div
                  className="placeholder-photo p-warm"
                  style={{ aspectRatio: "4 / 5" }}
                  data-label={`${clientConfig.contact.addressShort} — ${clientConfig.logoSubtitle}`}
                />
              </Reveal>
              <div
                className="absolute -bottom-8 -left-8 w-[220px] cartouche hidden md:block animate-fade-up"
                style={{ animationDelay: "900ms" }}
              >
                <div className="cartouche-inner text-center">
                  <div
                    className="h-caps text-white"
                    style={{ fontSize: 16, letterSpacing: "0.32em" }}
                  >
                    Cabinet
                  </div>
                  <div
                    className="h-caps text-white"
                    style={{
                      fontSize: 16,
                      letterSpacing: "0.32em",
                      marginTop: 4,
                    }}
                  >
                    Berthier
                  </div>
                  <div
                    className="mt-3 mono text-[9px] tracking-[0.24em] uppercase"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Fondé · {clientConfig.foundedYear}
                  </div>
                </div>
              </div>
              <div
                className="absolute -top-4 right-0 text-right animate-fade-up"
                style={{ animationDelay: "1100ms" }}
              >
                <div
                  className="mono text-[10px] tracking-[0.24em] uppercase"
                  style={{ color: "var(--cobalt)" }}
                >
                  48.858°N · 2.281°E
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── STATS BAND (ink) ──────────────── */}
      <section
        style={{ background: "var(--ink-raw)", color: "var(--paper-raw)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
          <div className="grid lg:grid-cols-12 gap-10">
            <Reveal as="div" kind="slide-right" className="lg:col-span-4">
              <div
                className="h-eyebrow mb-6"
                style={{ color: "rgba(244,237,224,0.55)" }}
              >
                ¶ Nº 02 — Le catalogue
              </div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(36px, 4.5vw, 60px)" }}
              >
                <CountUp value={totalCount} duration={1600} /> biens,
                <br />
                <em className="h-italic" style={{ color: "#d9c695" }}>
                  Paris intra-muros.
                </em>
              </h2>
              <p
                className="mt-6 text-[15px] max-w-sm"
                style={{ color: "rgba(244,237,224,0.7)" }}
              >
                Une sélection restreinte, majoritairement rive droite, dans les
                immeubles et quartiers que nous connaissons intimement.
              </p>
            </Reveal>

            <Reveal as="div" kind="slide-left" delay={150} className="lg:col-span-8">
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-px"
                style={{ background: "rgba(244,237,224,0.15)" }}
              >
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="py-10 px-5"
                    style={{ background: "var(--ink-raw)" }}
                  >
                    <div
                      className="h-display tabular"
                      style={{
                        fontSize: "clamp(48px, 4.5vw, 68px)",
                        color: "#d9c695",
                      }}
                    >
                      <CountUp
                        value={stat.value}
                        padStart={2}
                        delay={i * 80}
                        duration={1400}
                      />
                    </div>
                    <div
                      className="h-eyebrow mt-3"
                      style={{
                        color: "rgba(244,237,224,0.6)",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {arrondissements.length > 0 && (
                <div
                  className="mt-10 pt-8"
                  style={{
                    borderTop: "1px solid rgba(244,237,224,0.15)",
                  }}
                >
                  <div
                    className="h-eyebrow mb-5 flex items-baseline justify-between gap-4"
                    style={{
                      color: "rgba(244,237,224,0.55)",
                    }}
                  >
                    <span>Quartiers les plus actifs</span>
                    {arrondissements.length > 4 && (
                      <Link
                        href="/biens"
                        className="link-under text-[10px]"
                        style={{ color: "rgba(244,237,224,0.7)" }}
                      >
                        Tous les biens
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-10 gap-y-5">
                    {arrondissements.slice(0, 4).map((d) => (
                      <Link
                        key={d.code}
                        href={`/biens?arr=${encodeURIComponent(d.code)}`}
                        className="flex items-baseline gap-3 group"
                        aria-label={`${d.count} biens à ${d.label}`}
                      >
                        <span
                          className="h-display tabular transition-colors group-hover:text-[#d9c695]"
                          style={{
                            fontSize: 36,
                            color: d.highlight
                              ? "#d9c695"
                              : "var(--paper-raw)",
                          }}
                        >
                          <CountUp value={d.count} padStart={2} duration={1100} />
                        </span>
                        <span
                          className="h-small-caps transition-colors group-hover:text-[color:var(--paper-raw)]"
                          style={{
                            color: "rgba(244,237,224,0.7)",
                          }}
                        >
                          {d.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ──────────────── VUS RÉCEMMENT (client, conditionnel ≥ 2 biens) ──────────────── */}
      <RecentlyViewed />

      {/* ──────────────── SERVICES ──────────────── */}
      <section style={{ background: "var(--ivory-raw)" }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-28">
          <div className="grid lg:grid-cols-12 gap-10 items-end mb-14">
            <Reveal as="div" kind="slide-right" className="lg:col-span-7">
              <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 04 — Nos métiers</div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
              >
                Trois métiers,
                <br />
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  une seule
                </em>{" "}
                adresse.
              </h2>
            </Reveal>
            <Reveal as="div" kind="slide-left" delay={120} className="lg:col-span-5">
              <p
                className="text-[15px] leading-[1.7]"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                }}
              >
                Le Cabinet couvre l&apos;intégralité du cycle immobilier
                parisien, de la transaction à la gestion pour compte. Une même
                maison, un seul standard.
              </p>
            </Reveal>
          </div>

          <div
            className="grid md:grid-cols-3 gap-px"
            style={{ background: "var(--bone-raw)" }}
          >
            {SERVICES.map((service, idx) => (
              <Reveal
                key={service.num}
                kind="slide-up"
                delay={idx * 100}
                duration={800}
                as="div"
                className="card-lift"
              >
              <div
                className="p-8 lg:p-10 h-full"
                style={{ background: "var(--paper-raw)" }}
              >
                <div className="flex items-baseline gap-4 mb-6">
                  <div
                    className="h-display tabular"
                    style={{
                      fontSize: 56,
                      color: "var(--cobalt)",
                      lineHeight: 0.9,
                    }}
                  >
                    {service.num}
                  </div>
                  <div
                    className="h-caps"
                    style={{ fontSize: 18, letterSpacing: "0.28em" }}
                  >
                    {service.title}
                  </div>
                </div>
                <p
                  className="text-[15px] leading-[1.65] mb-6"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 78%, transparent)",
                  }}
                >
                  {service.lede}
                </p>
                <ul className="space-y-2.5 mb-8 text-[13px]">
                  {service.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3"
                      style={{
                        color:
                          "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                      }}
                    >
                      <span style={{ color: "var(--cobalt)" }}>
                        <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-5 rule">
                  <div
                    className="h-eyebrow"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    Référent
                  </div>
                  <div className="mt-1 text-[13px]">{service.lead}</div>
                </div>
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── BIENS EN VEDETTE (grid) ──────────────── */}
      {heroProperties.length > 0 && (
        <Reveal as="section" className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-24 pb-16">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
            <div>
              <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 05 — La sélection</div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
              >
                Biens en{" "}
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  vedette
                </em>
              </h2>
            </div>
            <Link href="/biens" className="link-under group">
              <span className="link-underline-thick">Voir tous les biens</span>
              <ArrowRight className="inline-block h-3 w-3 ml-2 group-arrow" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 gap-y-16">
            {heroProperties.map((property, i) => (
              <Reveal
                key={property.id}
                kind="scale"
                delay={(i % 3) * 100}
                duration={800}
              >
                <div
                  className="mb-3 mono text-[10px] tracking-[0.22em] uppercase"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 40%, transparent)",
                  }}
                >
                  — {String(i + 1).padStart(2, "0")} /{" "}
                  {String(heroProperties.length).padStart(2, "0")}
                </div>
                <PropertyCardMagazine
                  property={property}
                  index={i}
                  priority={i < 3}
                />
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}

      {/* ──────────────── MANIFESTE ──────────────── */}
      <section className="py-28" style={{ background: "var(--ivory-raw)" }}>
        <Reveal as="div" kind="slide-up" duration={1100} className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="chapter-mark mb-8 animate-eyebrow-in">Nº 06 — Manifeste</div>
          <blockquote
            className="h-display"
            style={{ fontSize: "clamp(32px, 4.2vw, 56px)", lineHeight: 1.15 }}
          >
            « Vendre un haussmannien, ce n&apos;est pas
            <br />
            conclure une transaction. C&apos;est confier
            <br />
            <em className="h-italic" style={{ color: "var(--cobalt)" }}>
              un lieu
            </em>{" "}
            — une vue sur les toits, une cage
            <br />
            d&apos;escalier en marbre, une histoire de famille —
            <br />à celui qui saura{" "}
            <em className="h-italic" style={{ color: "var(--cobalt)" }}>
              l&apos;habiter.
            </em>{" "}
            »
          </blockquote>
          <div className="mt-12 flex items-center gap-5">
            <div
              className="placeholder-photo p-dusk w-16 h-16 rounded-full"
              data-label=""
            />
            <div>
              <div
                className="h-caps"
                style={{ fontSize: 13, letterSpacing: "0.28em" }}
              >
                Julien Berthier
              </div>
              <div
                className="h-eyebrow mt-1"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                Fondateur · depuis {clientConfig.foundedYear}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──────────────── TEMOIGNAGES ──────────────── */}
      {testimonials.length > 0 && (
        <Reveal as="section" className="max-w-[1440px] mx-auto px-6 lg:px-10 py-28">
          <div className="grid lg:grid-cols-12 gap-10 mb-14 items-end">
            <div className="lg:col-span-6">
              <div className="chapter-mark mb-6 animate-eyebrow-in">
                Nº 07 — Ils nous ont confié leur adresse
              </div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
              >
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  Témoignages
                </em>
                <br />
                clients &amp; confrères.
              </h2>
            </div>
            <div className="lg:col-span-6 lg:pl-8">
              <p
                className="text-[15px] leading-[1.7]"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                }}
              >
                De la place du Trocadéro au boulevard de Courcelles — une
                clientèle fidèle qui transmet notre adresse de relation en
                relation depuis bientôt trois décennies.
              </p>
            </div>
          </div>

          <div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: "var(--bone-raw)" }}
          >
            {testimonials.slice(0, 6).map((t, i) => (
              <Reveal
                key={t.id}
                kind="slide-up"
                delay={(i % 3) * 110}
                duration={900}
                className="p-8 lg:p-10 bg-[color:var(--paper-raw)]"
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
              </Reveal>
            ))}
          </div>
        </Reveal>
      )}

      {/* ──────────────── JOURNAL ──────────────── */}
      {posts.length > 0 && (
        <Reveal as="section" className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-28">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
            <div>
              <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 08 — Le Journal</div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
              >
                Lectures du{" "}
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  marché.
                </em>
              </h2>
            </div>
            <Link href="/blog" className="link-under group">
              <span className="link-underline-thick">Tous les articles</span>
              <ArrowRight className="inline-block h-3 w-3 ml-2 group-arrow" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {posts.slice(0, 3).map((post, i) => {
              const palette =
                PLACEHOLDER_PALETTES[i % PLACEHOLDER_PALETTES.length];
              return (
                <Reveal
                  key={post.id}
                  kind="slide-up"
                  delay={i * 100}
                  duration={800}
                  as="div"
                >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div
                    className={`placeholder-photo ${palette} relative mb-5 overflow-hidden img-overlay-cobalt`}
                    style={{ aspectRatio: "4 / 3" }}
                    data-label="Journal"
                  >
                    {post.cover_url && (
                      <div className="absolute inset-0 group-zoom">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-3 mb-3 h-eyebrow"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                    }}
                  >
                    <span style={{ color: "var(--cobalt)" }}>Article</span>
                  </div>
                  <h3
                    className="h-display mb-3 group-hover:text-[color:var(--cobalt)] transition-colors"
                    style={{ fontSize: 26, lineHeight: 1.1 }}
                  >
                    <span className="link-underline-anim">{post.title}</span>
                  </h3>
                  {post.excerpt && (
                    <p
                      className="text-[14px]"
                      style={{
                        color:
                          "color-mix(in oklch, var(--ink-raw) 70%, transparent)",
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}
                  <div
                    className="mt-4 h-small-caps inline-flex items-center gap-2"
                    style={{ color: "var(--cobalt)" }}
                  >
                    Lire l&apos;article
                    <ArrowRight
                      className="h-3 w-3 group-arrow"
                      strokeWidth={1.5}
                    />
                  </div>
                </Link>
                </Reveal>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* ──────────────── ADRESSE / CTA ──────────────── */}
      <Reveal as="section" kind="slide-up" className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-28">
        <div
          className="grid lg:grid-cols-2 gap-0"
          style={{ border: "1px solid var(--bone-raw)" }}
        >
          <div className="facade-bg relative min-h-[480px] lg:min-h-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="cartouche" style={{ padding: "40px 56px" }}>
                <div className="cartouche-inner">
                  <div
                    className="h-caps text-center"
                    style={{
                      fontSize: 22,
                      letterSpacing: "0.36em",
                      color: "white",
                    }}
                  >
                    Cabinet
                  </div>
                  <div
                    className="h-caps text-center"
                    style={{
                      fontSize: 22,
                      letterSpacing: "0.36em",
                      color: "white",
                      marginTop: 6,
                    }}
                  >
                    Berthier
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="p-10 lg:p-16 flex flex-col justify-between"
            style={{ background: "var(--paper-raw)" }}
          >
            <div>
              <div className="chapter-mark mb-8 animate-eyebrow-in">Nº 09 — Nous rencontrer</div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
              >
                Passez au
                <br />
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  Cabinet.
                </em>
              </h2>
              <p
                className="mt-6 text-[15px] leading-[1.7] max-w-md"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                }}
              >
                Pas de formulaire, pas de standard téléphonique. Poussez la
                porte, asseyez-vous, parlez-nous de votre projet — ou prenez
                rendez-vous.
              </p>
            </div>

            <div className="mt-10 pt-8 rule space-y-5">
              <div className="flex items-start gap-4">
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <AddressLink
                  address={clientConfig.contact.addressShort}
                  city="Paris"
                  postalCode="75116"
                  href={s.agency_maps_url || clientConfig.contact.mapsUrl}
                  unstyled
                  className="block hover:text-[color:var(--cobalt)] transition-colors no-underline"
                >
                  <div className="text-[15px] font-medium">
                    {clientConfig.contact.addressShort}
                  </div>
                  <div
                    className="text-[13px]"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                    }}
                  >
                    75116 Paris · Métro Kléber / Boissière
                  </div>
                </AddressLink>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <a
                  href={`tel:${(s.agency_phone || clientConfig.contact.phone).replace(/\s/g, "")}`}
                  className="text-[15px] tabular hover:text-[color:var(--cobalt)] transition-colors"
                >
                  {s.agency_phone || clientConfig.contact.phone}
                </a>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <div className="text-[15px]">
                  {s.agency_hours || clientConfig.contact.hours}
                </div>
              </div>

              <div className="pt-5 flex flex-wrap gap-4">
                <Link href="/contact" className="btn-ink btn-shimmer group">
                  Prendre rendez-vous
                  <ArrowRight className="h-3.5 w-3.5 group-arrow" strokeWidth={1.5} />
                </Link>
                {s.agency_maps_url && (
                  <a
                    href={s.agency_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                  >
                    Itinéraire
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

const PLACEHOLDER_PALETTES = [
  "p-warm",
  "p-cool",
  "p-night",
  "p-dusk",
  "p-stone",
  "p-roof",
];
