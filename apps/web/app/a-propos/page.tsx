import { getAboutData } from "@/lib/data";
import type { Agent } from "@repo/shared/supabase/types";
import type { Metadata } from "next";
import { clientConfig, yearsOfExperience } from "@repo/shared/client-config";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PropertyImage } from "@repo/ui/property-image";
import { AgencyMap } from "@/components/agency-map";
import { AddressLink } from "@/components/address-link";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";

// Quartier Trocadéro, 75116 Paris — coordonnées WGS84 (approximatives)
const AGENCY_LAT = 48.858;
const AGENCY_LNG = 2.281;

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Le Cabinet",
  description: clientConfig.description,
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: `Le Cabinet · ${clientConfig.agencyFullName}`,
    description: clientConfig.description,
    type: "website",
    images: ["/opengraph-image"],
  },
};

const TIMELINE = [
  {
    year: String(clientConfig.foundedYear),
    title: "Fondation",
    text: `Julien Berthier ouvre le Cabinet au ${clientConfig.contact.addressShort}, entre Kléber et Boissière.`,
  },
  {
    year: "2005",
    title: "Direction",
    text: "Julien Berthier prend la direction effective du cabinet et structure l'offre autour de trois métiers : vente, location, gestion.",
  },
  {
    year: "2011",
    title: "Pôle biens d'exception",
    text: "Développement d'un accompagnement dédié aux biens haussmanniens supérieurs à 3 M€.",
  },
  {
    year: "2016",
    title: "Département gestion",
    text: "Ouverture d'un pôle gestion locative pour propriétaires bailleurs particuliers et institutionnels.",
  },
  {
    year: "2020",
    title: "Clientèle internationale",
    text: "Renforcement de l'offre bilingue français-anglais pour la clientèle internationale du 16ᵉ.",
  },
  {
    year: String(new Date().getFullYear()),
    title: "Aujourd'hui",
    text: `Un catalogue actif, une équipe restreinte, une seule adresse — ${clientConfig.contact.addressShort}.`,
  },
];

const QUARTIERS = [
  {
    name: "Passy",
    desc: "Le 16ᵉ classique, familial. Écoles privées, boulangeries, immeubles 1900.",
  },
  {
    name: "Trocadéro",
    desc: "La vue sur la Tour. Les plus beaux haussmanniens de l'arrondissement.",
  },
  {
    name: "Auteuil",
    desc: "Le village. Maisons de ville, calme, derniers jardins privés.",
  },
  {
    name: "Chaillot",
    desc: "Le luxe discret. Avenue Foch, avenue Georges-Mandel, Étoile.",
  },
];

const AGENT_PALETTES = ["p-dusk", "p-warm", "p-stone", "p-cool"];

export default async function AboutPage() {
  const {
    agents,
    settings: s,
    saleCount,
    rentCount,
    agentCount,
  } = await getAboutData();

  const years = yearsOfExperience();
  const totalCount = saleCount + rentCount;
  const agencyName = s.agency_name || clientConfig.agencyFullName;
  const description =
    s.about_description || s.agency_description || clientConfig.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: agencyName,
    description: s.agency_description || "",
    foundingDate: String(clientConfig.foundedYear),
    ...(s.agency_address && {
      address: { "@type": "PostalAddress", streetAddress: s.agency_address },
    }),
    ...(s.agency_phone && { telephone: s.agency_phone }),
    ...(s.agency_email && { email: s.agency_email }),
    ...(process.env.NEXT_PUBLIC_SITE_URL && {
      url: process.env.NEXT_PUBLIC_SITE_URL,
    }),
    numberOfEmployees: agentCount,
  };

  const phone = s.agency_phone || clientConfig.contact.phone;
  const email = s.agency_email || clientConfig.contact.email;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero manifesto */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Le Cabinet</div>
            <Reveal kind="mask-y" duration={1100}>
              <h1
                className="h-display"
                style={{ fontSize: "clamp(52px, 7.5vw, 120px)" }}
              >
                Un cabinet,
                <br />
                une{" "}
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  adresse,
                </em>
                <br />
                une clientèle.
              </h1>
            </Reveal>
          </div>
          <Reveal as="div" kind="slide-up" delay={250} className="lg:col-span-7 lg:pl-10">
            <p
              className="h-italic"
              style={{
                fontSize: "clamp(20px, 1.8vw, 26px)",
                lineHeight: 1.55,
                color: "var(--ink-raw)",
              }}
            >
              Fondé en {clientConfig.foundedYear} par Julien Berthier, le{" "}
              {clientConfig.agencyName} est une agence immobilière
              indépendante installée au {clientConfig.contact.addressShort}, à
              deux pas du Trocadéro et de l&apos;Étoile.
            </p>
            <p
              className="mt-6 text-[16px] leading-[1.75]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 78%, transparent)",
              }}
            >
              {description}
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 rule">
              {[
                { v: clientConfig.foundedYear, l: "Fondation", anim: true },
                { v: years, l: "Années d'expertise", anim: true },
                { v: agentCount, l: "Associés", anim: true, pad: 2 },
              ].map((stat, i) => (
                <div key={i}>
                  <div
                    className="h-display tabular"
                    style={{ fontSize: 52, color: "var(--cobalt)" }}
                  >
                    <CountUp
                      value={stat.v}
                      duration={1500}
                      delay={i * 120}
                      padStart={stat.pad ?? 0}
                    />
                  </div>
                  <div
                    className="h-eyebrow mt-1"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                    }}
                  >
                    {stat.l}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Full-bleed facade cartouche */}
      <section className="mb-24">
        <div className="facade-bg relative" style={{ aspectRatio: "21 / 9" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="cartouche max-w-[calc(100%-32px)]"
              style={{ padding: "clamp(28px, 5vw, 50px) clamp(24px, 6vw, 80px)" }}
            >
              <div className="cartouche-inner text-center">
                <div
                  className="h-caps"
                  style={{
                    fontSize: 42,
                    letterSpacing: "0.38em",
                    color: "white",
                  }}
                >
                  Cabinet
                </div>
                <div
                  className="h-caps"
                  style={{
                    fontSize: 42,
                    letterSpacing: "0.38em",
                    color: "white",
                    marginTop: 10,
                  }}
                >
                  Berthier
                </div>
                <div
                  className="mt-6 mono text-[11px] tracking-[0.26em] uppercase"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  Transactions Immobilières · Depuis{" "}
                  {clientConfig.foundedYear}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-[1200px] mx-auto px-6 lg:px-10 pb-28">
        <Reveal as="div" kind="slide-up">
          <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 02 — Chronologie</div>
          <h2
            className="h-display mb-14"
            style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
          >
            {clientConfig.foundedYear}{" "}
            <em className="h-italic" style={{ color: "var(--cobalt)" }}>
              →
            </em>{" "}
            aujourd&apos;hui.
          </h2>
        </Reveal>

        <div className="relative">
          <div
            className="absolute left-[116px] top-2 bottom-2 w-px hidden md:block"
            style={{ background: "var(--bone-raw)" }}
            aria-hidden="true"
          />
          <div className="space-y-12">
            {TIMELINE.map((e, i) => (
              <Reveal
                key={i}
                kind={i % 2 === 0 ? "slide-right" : "slide-left"}
                delay={i * 80}
                duration={800}
                as="div"
                className="flex flex-col md:flex-row gap-4 md:gap-10 items-start relative"
              >
                <div
                  className="h-display tabular"
                  style={{
                    fontSize: 44,
                    color: "var(--cobalt)",
                    width: 100,
                    lineHeight: 1,
                  }}
                >
                  {e.year}
                </div>
                <div className="relative">
                  <span
                    className="absolute -left-[34px] top-3 h-3 w-3 rounded-full hidden md:block"
                    style={{ background: "var(--cobalt)" }}
                    aria-hidden="true"
                  />
                  <div
                    className="h-caps mb-2"
                    style={{ fontSize: 13, letterSpacing: "0.28em" }}
                  >
                    {e.title}
                  </div>
                  <p
                    className="text-[15px] leading-[1.65] max-w-lg"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 78%, transparent)",
                    }}
                  >
                    {e.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team grid */}
      {agents.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-28">
          <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
            <Reveal as="div" kind="slide-right">
              <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 03 — L&apos;équipe</div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(36px, 5vw, 68px)" }}
              >
                {teamHeading(agents.length)}{" "}
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  {agents.length > 1 ? "associés." : "interlocuteur."}
                </em>
              </h2>
            </Reveal>
            <Reveal
              as="p"
              kind="slide-left"
              delay={150}
              className="max-w-md text-[15px] leading-[1.7] hidden md:block"
            >
              <span
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                }}
              >
                Une équipe restreinte, volontairement. Chez nous, chaque
                transaction est suivie de bout en bout par un interlocuteur
                unique.
              </span>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {agents.map((agent: Agent, i: number) => (
              <Reveal
                key={agent.id}
                kind="scale"
                delay={Math.min(i, 5) * 90}
                duration={800}
                as="div"
              >
                <TeamCard agent={agent} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Quartiers du 16ᵉ (ink) */}
      <section
        className="py-28"
        style={{ background: "var(--ink-raw)", color: "var(--paper-raw)" }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <Reveal as="div" kind="slide-right" className="lg:col-span-5">
              <div
                className="h-eyebrow mb-6"
                style={{ color: "rgba(244,237,224,0.55)" }}
              >
                ¶ Nº 04 — Nos quartiers
              </div>
              <h2
                className="h-display"
                style={{ fontSize: "clamp(40px, 5.5vw, 76px)" }}
              >
                Le 16ᵉ n&apos;est pas
                <br />
                un bloc,
                <br />
                c&apos;est un{" "}
                <em className="h-italic" style={{ color: "#d9c695" }}>
                  archipel.
                </em>
              </h2>
              <p
                className="mt-8 max-w-sm text-[15px]"
                style={{ color: "rgba(244,237,224,0.75)" }}
              >
                Passy, Auteuil, Chaillot, Muette, Trocadéro : chaque quartier
                du 16ᵉ arrondissement a son architecture, sa démographie, ses
                prix.
              </p>
            </Reveal>

            <div
              className="lg:col-span-7 grid sm:grid-cols-2 gap-px"
              style={{ background: "rgba(244,237,224,0.15)" }}
            >
              {QUARTIERS.map((q, i) => (
                <Reveal
                  key={q.name}
                  kind="slide-up"
                  delay={i * 90}
                  duration={800}
                  as="div"
                  className="card-lift"
                >
                <div
                  className="p-8 h-full"
                  style={{ background: "var(--ink-raw)" }}
                >
                  <div
                    className="mono text-[11px] tracking-[0.22em] uppercase"
                    style={{ color: "#d9c695" }}
                  >
                    Nº 0{i + 1}
                  </div>
                  <h3
                    className="h-display mt-3 mb-3"
                    style={{ fontSize: 34, color: "var(--paper-raw)" }}
                  >
                    {q.name}
                  </h3>
                  <p
                    className="text-[13.5px] leading-[1.65]"
                    style={{ color: "rgba(244,237,224,0.72)" }}
                  >
                    {q.desc}
                  </p>
                </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Adresse split */}
      <Reveal as="section" kind="slide-up" className="max-w-[1440px] mx-auto px-6 lg:px-10 py-28">
        <div
          className="grid lg:grid-cols-2 gap-0"
          style={{ border: "1px solid var(--bone-raw)" }}
        >
          <div className="p-10 lg:p-16">
            <div className="chapter-mark mb-8 animate-eyebrow-in">Nº 05 — Notre adresse</div>
            <h2
              className="h-display mb-8"
              style={{ fontSize: "clamp(36px, 4.5vw, 60px)" }}
            >
              {addressLine1(clientConfig.contact.addressShort)}
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                {addressLine2(clientConfig.contact.addressShort)}.
              </em>
            </h2>
            <p
              className="text-[15px] leading-[1.7] mb-10"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 78%, transparent)",
              }}
            >
              Entre la place des États-Unis et la rue Copernic, à cinq minutes
              à pied du Trocadéro comme de l&apos;Étoile. Métro Kléber (ligne
              6) ou Boissière (ligne 6).
            </p>

            <div className="space-y-5 pt-8 rule">
              <div className="flex items-start gap-4">
                <MapPin className="h-4 w-4 mt-1 shrink-0" strokeWidth={1.5} />
                <AddressLink
                  address={clientConfig.contact.addressShort}
                  city="Paris"
                  postalCode="75116"
                  lat={AGENCY_LAT}
                  lng={AGENCY_LNG}
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
                    75116 Paris
                  </div>
                </AddressLink>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-4 w-4 mt-1 shrink-0" strokeWidth={1.5} />
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="text-[15px] tabular hover:text-[color:var(--cobalt)] transition-colors"
                >
                  {phone}
                </a>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="h-4 w-4 mt-1 shrink-0" strokeWidth={1.5} />
                <a
                  href={`mailto:${email}`}
                  className="text-[15px] hover:text-[color:var(--cobalt)] transition-colors truncate"
                >
                  {email}
                </a>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="h-4 w-4 mt-1 shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-[15px]">
                    {s.agency_hours || clientConfig.contact.hours}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-ink btn-shimmer group">
                Nous écrire
                <ArrowRight className="inline-block h-3.5 w-3.5 ml-2 group-arrow" strokeWidth={1.5} />
              </Link>
              {(s.agency_maps_url || clientConfig.contact.mapsUrl) && (
                <a
                  href={s.agency_maps_url || clientConfig.contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  Itinéraire
                </a>
              )}
            </div>
          </div>
          <div className="relative min-h-[500px]">
            <AgencyMap
              latitude={AGENCY_LAT}
              longitude={AGENCY_LNG}
              address={`${clientConfig.contact.addressShort} · 75116 Paris`}
            />
            <div
              className="absolute bottom-4 left-4 px-4 py-3 text-[11px] tracking-[0.18em] uppercase pointer-events-none z-[1]"
              style={{
                background: "var(--paper-raw)",
                border: "1px solid var(--bone-raw)",
              }}
            >
              {clientConfig.logoSubtitle} · Kléber
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function TeamCard({ agent, index }: { agent: Agent; index: number }) {
  const palette = AGENT_PALETTES[index % AGENT_PALETTES.length];
  const fullName = `${agent.first_name} ${agent.last_name}`;
  const role =
    agent.role === "admin" ? "Gérant · Direction" : "Négociateur";

  return (
    <article className="group">
      <div
        className={`placeholder-photo ${palette} mb-5 relative overflow-hidden img-overlay-cobalt`}
        style={{ aspectRatio: "3 / 4" }}
        data-label={`Nº 0${index + 1}`}
      >
        {agent.photo_url && (
          <div className="absolute inset-0 group-zoom">
            <PropertyImage
              src={agent.photo_url}
              alt={fullName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <div
          className="mono text-[11px] tracking-[0.2em]"
          style={{ color: "var(--cobalt)" }}
        >
          Nº 0{index + 1}
        </div>
      </div>
      <h3 className="h-display mb-1" style={{ fontSize: 26, lineHeight: 1.1 }}>
        {fullName}
      </h3>
      <div
        className="h-italic mb-4"
        style={{
          fontSize: 15,
          color: "color-mix(in oklch, var(--ink-raw) 70%, transparent)",
        }}
      >
        {role}
      </div>
      {agent.bio && (
        <p
          className="text-[13.5px] leading-[1.65]"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 75%, transparent)",
          }}
        >
          {agent.bio}
        </p>
      )}
      <div className="mt-4 pt-4 rule space-y-2 text-[12px]">
        {agent.phone && (
          <a
            href={`tel:${agent.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 hover:text-[color:var(--cobalt)] transition-colors"
          >
            <Phone className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            {agent.phone}
          </a>
        )}
        {agent.email && (
          <a
            href={`mailto:${agent.email}`}
            className="flex items-center gap-2 hover:text-[color:var(--cobalt)] transition-colors truncate"
          >
            <Mail className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{agent.email}</span>
          </a>
        )}
      </div>
    </article>
  );
}

function teamHeading(count: number): string {
  const words: Record<number, string> = {
    1: "Un",
    2: "Deux",
    3: "Trois",
    4: "Quatre",
    5: "Cinq",
    6: "Six",
    7: "Sept",
  };
  return words[count] || String(count);
}

function addressLine1(full: string): string {
  // "1 rue Exemple" -> "1 rue"
  const parts = full.split(" ");
  return parts.slice(0, Math.max(1, parts.length - 1)).join(" ");
}

function addressLine2(full: string): string {
  // -> "Exemple"
  const parts = full.split(" ");
  return parts[parts.length - 1] || full;
}
