import {
  getPropertyBySlug,
  getPropertyMeta,
  getSimilarProperties,
  getAllPropertySlugs,
} from "@/lib/data";
import { notFound } from "next/navigation";
import { PropertyGalleryEditorial } from "@/components/property-gallery-editorial";
import dynamic from "next/dynamic";

// Lazy-load les composants below-the-fold (MapLibre ~150KB, mortgage calc, drawer).
// Réduit le JS initial de ~300 KB sur /detail mobile.
const VisitRequestDrawer = dynamic(
  () => import("@/components/visit-request-drawer").then((m) => m.VisitRequestDrawer),
);
const MortgageCalculatorEditorial = dynamic(
  () =>
    import("@/components/mortgage-calculator-editorial").then(
      (m) => m.MortgageCalculatorEditorial,
    ),
);
const PropertyLocation = dynamic(
  () => import("@/components/property-location").then((m) => m.PropertyLocation),
  {
    loading: () => (
      <div
        style={{
          aspectRatio: "16 / 9",
          minHeight: 360,
          background: "var(--ivory-raw)",
          border: "1px solid var(--bone-raw)",
        }}
      />
    ),
  },
);
import { PropertyCardMagazine } from "@/components/property-card-magazine";
import { RecentlyViewedTracker } from "@/components/recently-viewed-tracker";
import { AddressLink } from "@/components/address-link";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { clientConfig } from "@repo/shared/client-config";
import {
  formatPrice,
  formatSurface,
  getPropertyTypeLabel,
  getTransactionTypeLabel,
  getDocumentTypeLabel,
} from "@repo/shared/utils";
import {
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Globe,
  Check,
  ArrowRight,
  FileText,
  Square,
  DoorOpen,
  Bed,
  Bath,
  Leaf,
  Flame,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";

export const revalidate = 3600;

function ref(id: string) {
  const hex = id.replace(/[^a-f0-9]/gi, "").slice(-4).toUpperCase();
  const prefix =
    clientConfig.agencyShortName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 3) || "AG";
  return `${prefix}-${hex || "0000"}`;
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllPropertySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyMeta(slug);
  if (!property) return { title: "Bien non trouvé" };
  const title = `${property.title} — ${getTransactionTypeLabel(property.transaction_type)} ${property.city}`;
  const description = `${formatPrice(property.price)} · ${formatSurface(property.surface)} · ${property.rooms} pièces — ${property.description.slice(0, 120)}`;
  const images = property.image_url
    ? [{ url: property.image_url, width: 1200, height: 630, alt: property.title }]
    : [];
  return {
    title,
    description,
    alternates: { canonical: `/biens/${slug}` },
    openGraph: { title, description, type: "website", images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();
  const agent = property.agents;
  const refStr = ref(property.id);
  const isRent = property.transaction_type === "location";
  const isSold = Boolean(property.sold_at);
  const soldVerb = isRent ? "loué" : "vendu";
  const soldDateLabel = property.sold_at
    ? new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric",
      }).format(new Date(property.sold_at))
    : null;
  const pricePerM2 =
    property.price > 0 && property.surface > 0
      ? Math.round(property.price / property.surface)
      : null;

  const agentName = agent
    ? `${agent.first_name} ${agent.last_name}`
    : clientConfig.agencyName;
  const agentRole = agent
    ? agent.role === "admin"
      ? "Gérant"
      : "Négociateur"
    : "Équipe commerciale";
  const agentPhone = agent?.phone || clientConfig.contact.phone;
  const agentEmail = agent?.email || clientConfig.contact.email;

  return (
    <div>
      <RecentlyViewedTracker slug={slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: property.title,
            description: property.description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/biens/${property.slug}`,
            datePosted: property.created_at,
            offers: {
              "@type": "Offer",
              price: property.price,
              priceCurrency: "EUR",
            },
            address: {
              "@type": "PostalAddress",
              streetAddress: property.address,
              addressLocality: property.city,
              postalCode: property.postal_code,
              addressCountry: "FR",
            },
            ...(property.latitude &&
              property.longitude && {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: property.latitude,
                  longitude: property.longitude,
                },
              }),
            floorSize: {
              "@type": "QuantitativeValue",
              value: property.surface,
              unitCode: "MTK",
            },
            numberOfRooms: property.rooms,
            numberOfBedrooms: property.bedrooms,
            numberOfBathroomsTotal: property.bathrooms,
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-8 pb-4">
        <nav
          aria-label="Fil d'Ariane"
          className="h-eyebrow flex items-center gap-3 flex-wrap"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          <Link href="/" className="hover:text-[color:var(--ink-raw)] transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-2.5 w-2.5" strokeWidth={1.5} />
          <Link href="/biens" className="hover:text-[color:var(--ink-raw)] transition-colors">
            Biens
          </Link>
          <ChevronRight className="h-2.5 w-2.5" strokeWidth={1.5} />
          <span style={{ color: "var(--cobalt)" }}>{refStr}</span>
        </nav>
      </div>

      {/* Bandeau "ce bien a été vendu/loué" — DA cobalt magazine : filet rouge
          en haut + fond ivory, eyebrow uppercase + phrase italique. */}
      {isSold && (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-6">
          <div
            className="px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            style={{
              background: "var(--ivory-raw)",
              borderTop: "2px solid oklch(0.45 0.18 25)",
              borderBottom: "1px solid var(--bone-raw)",
            }}
          >
            <div className="flex items-baseline gap-3">
              <span
                className="mono text-[10px] tracking-[0.22em] uppercase shrink-0"
                style={{ color: "oklch(0.45 0.18 25)" }}
              >
                {isRent ? "Loué" : "Vendu"}
              </span>
              <p className="h-italic text-[15px] md:text-[17px] leading-[1.4]">
                Ce bien a été {soldVerb}
                {soldDateLabel && <> en {soldDateLabel}</>}.
              </p>
            </div>
            <Link
              href="/biens"
              className="inline-flex items-center gap-2 mono text-[10px] tracking-[0.22em] uppercase shrink-0 transition-colors hover:text-[color:var(--cobalt-deep)]"
              style={{ color: "var(--cobalt)" }}
            >
              Voir nos biens disponibles
              <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      )}

      {/* Hero — gallery + title aside */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Reveal as="div" kind="clip-x" duration={1100} className="lg:col-span-8">
            <PropertyGalleryEditorial
              media={property.property_media || []}
              propertyId={property.id}
              title={property.title}
              transactionType={property.transaction_type as "vente" | "location"}
            />
          </Reveal>

          <Reveal as="div" kind="slide-up" delay={150} className="lg:col-span-4 lg:pl-4">
            <div
              className="mono text-[11px] tracking-[0.22em] uppercase mb-5"
              style={{ color: "var(--cobalt)" }}
            >
              {clientConfig.agencyName} · Référence {refStr}
            </div>
            <h1
              className="h-display"
              style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1.05 }}
            >
              {property.title}
            </h1>
            {property.city && (
              <div
                className="h-italic mt-4"
                style={{
                  fontSize: 20,
                  color:
                    "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
                }}
              >
                {property.city}
                {property.postal_code && `, ${property.postal_code}`}
              </div>
            )}

            <div className="mt-8 pt-6 rule-ink">
              <div
                className="h-eyebrow mb-2"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                }}
              >
                Prix {isRent ? "mensuel" : "affiché"}
              </div>
              <div
                className="h-display tabular"
                style={{ fontSize: 44, color: "var(--cobalt)" }}
              >
                {formatPrice(property.price)}
                {isRent && (
                  <span className="text-[20px] ml-2">/ mois</span>
                )}
              </div>
              {!isRent && pricePerM2 && (
                <div
                  className="h-eyebrow mt-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  soit{" "}
                  <span className="tabular">
                    {pricePerM2.toLocaleString("fr-FR")} €/m²
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-start gap-4">
              <MapPin className="h-4 w-4 mt-1 shrink-0" strokeWidth={1.5} />
              <AddressLink
                address={property.address}
                city={property.city}
                postalCode={property.postal_code}
                lat={property.latitude}
                lng={property.longitude}
                unstyled
                className="block hover:text-[color:var(--cobalt)] transition-colors no-underline"
              >
                <div className="text-[15px]">{property.address}</div>
                <div
                  className="h-eyebrow mt-1"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  {property.city}
                  {property.postal_code && ` · ${property.postal_code}`}
                </div>
              </AddressLink>
            </div>

            <div className="mt-8 space-y-3">
              {isSold ? (
                <Link
                  href="/biens"
                  className="w-full inline-flex items-center justify-center gap-2.5 h-[50px] px-[22px] text-[12px] tracking-[0.18em] uppercase font-medium transition-colors"
                  style={{
                    background: "var(--cobalt)",
                    border: "1px solid var(--cobalt)",
                    color: "white",
                  }}
                >
                  Voir nos biens disponibles
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              ) : (
                <VisitRequestDrawer
                  propertyId={property.id}
                  propertyTitle={property.title}
                  propertyRef={refStr}
                  className="w-full justify-center !h-[50px] !bg-[var(--cobalt)] !border !border-[var(--cobalt)] !px-[22px] !text-[12px] !tracking-[0.18em] uppercase !font-medium hover:!bg-[var(--cobalt-deep)] hover:!border-[var(--cobalt-deep)]"
                  label="Demander une visite"
                />
              )}
              <a
                href={`tel:${(agentPhone || "").replace(/\s/g, "")}`}
                className="w-full inline-flex items-center justify-center gap-2.5 h-[50px] px-[22px] text-[12px] tracking-[0.18em] uppercase font-medium border border-[var(--ink-raw)] text-[var(--ink-raw)] bg-transparent hover:bg-[var(--ink-raw)] hover:text-[var(--paper-raw)] transition-colors"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                {agentPhone}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Key metrics band */}
      <section
        className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10"
        style={{
          borderTop: "1px solid var(--bone-raw)",
          borderBottom: "1px solid var(--bone-raw)",
        }}
      >
        <Reveal as="div" kind="slide-up" duration={800}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-4">
          {buildMetrics(property).map((metric, i) => {
            const numeric = /^\d+$/.test(metric.v) ? Number(metric.v) : null;
            return (
            <div key={i} className="flex items-start gap-4 group">
              <div className="icon-scale" style={{ color: "var(--cobalt)" }}>{metric.icon}</div>
              <div>
                <div
                  className="h-display tabular"
                  style={{ fontSize: 32, lineHeight: 1 }}
                >
                  {numeric !== null ? (
                    <CountUp value={numeric} duration={1200} delay={i * 60} />
                  ) : (
                    metric.v
                  )}
                  {metric.u && (
                    <span
                      className="text-[16px] ml-1"
                      style={{
                        color:
                          "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                      }}
                    >
                      {metric.u}
                    </span>
                  )}
                </div>
                <div
                  className="h-eyebrow mt-1"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  {metric.l}
                </div>
              </div>
            </div>
            );
          })}
        </div>
        </Reveal>
      </section>

      {/* Description + aside agent */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <Reveal as="div" kind="slide-up" delay={100}>
              <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Le bien</div>
              <h2
                className="h-display mb-8"
                style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
              >
                {getPropertyTypeLabel(property.type)} ·{" "}
                <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                  {getTransactionTypeLabel(property.transaction_type)}
                </em>
              </h2>

              {property.description && (
                <div
                  className="text-[15px] leading-[1.8] space-y-4 whitespace-pre-wrap max-w-[720px]"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 82%, transparent)",
                  }}
                >
                  {property.description}
                </div>
              )}
            </Reveal>

            {/* Prestations */}
            {property.features && property.features.length > 0 && (
              <Reveal as="div" kind="slide-up" delay={150} className="mt-12">
                <div
                  className="h-eyebrow mb-5"
                  style={{ color: "var(--cobalt)" }}
                >
                  ¶ Prestations
                </div>
                <div className="grid sm:grid-cols-2 gap-x-8 stagger-fade">
                  {property.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-3 py-3 rule"
                    >
                      <Check
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={2}
                      />
                      <span className="text-[14px]">{f}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Énergie / DPE */}
            {(property.energy_rating ||
              property.ghg_rating ||
              property.construction_year ||
              property.heating_type ||
              (property.energy_sources?.length ?? 0) > 0) && (
              <Reveal as="div" kind="slide-up" delay={150} className="mt-12">
              <div
                className="p-8"
                style={{ background: "var(--ivory-raw)" }}
              >
                <div
                  className="h-eyebrow mb-5"
                  style={{ color: "var(--cobalt)" }}
                >
                  ¶ Diagnostic de performance énergétique
                </div>
                <div className="grid sm:grid-cols-2 gap-8">
                  {property.energy_rating && (
                    <DpeGauge
                      label="DPE"
                      active={property.energy_rating as string}
                    />
                  )}
                  {property.ghg_rating && (
                    <DpeGauge
                      label="GES"
                      active={property.ghg_rating as string}
                    />
                  )}
                </div>

                {(property.construction_year ||
                  property.heating_type ||
                  (property.energy_sources?.length ?? 0) > 0) && (
                  <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    {property.construction_year && (
                      <div className="flex flex-col gap-0.5">
                        <dt
                          className="h-eyebrow"
                          style={{
                            color:
                              "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                          }}
                        >
                          Année de construction
                        </dt>
                        <dd>{property.construction_year}</dd>
                      </div>
                    )}
                    {property.heating_type && (
                      <div className="flex flex-col gap-0.5">
                        <dt
                          className="h-eyebrow"
                          style={{
                            color:
                              "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                          }}
                        >
                          Type de chauffage
                        </dt>
                        <dd>{property.heating_type}</dd>
                      </div>
                    )}
                    {property.energy_sources?.length ? (
                      <div className="flex flex-col gap-0.5 sm:col-span-2">
                        <dt
                          className="h-eyebrow"
                          style={{
                            color:
                              "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                          }}
                        >
                          Sources d&apos;énergie
                        </dt>
                        <dd>{property.energy_sources.join(" · ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                )}
              </div>
              </Reveal>
            )}

            {/* Documents */}
            {property.property_documents?.length > 0 && (
              <Reveal as="div" kind="slide-up" delay={150} className="mt-12">
                <div
                  className="h-eyebrow mb-5"
                  style={{ color: "var(--cobalt)" }}
                >
                  ¶ Documents
                </div>
                <div
                  className="flex flex-col"
                  style={{
                    borderTop: "1px solid var(--bone-raw)",
                    borderBottom: "1px solid var(--bone-raw)",
                  }}
                >
                  {property.property_documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 py-3 px-2 text-sm hover:bg-[color:var(--ivory-raw)] transition-colors rule"
                    >
                      <FileText
                        className="h-4 w-4 shrink-0"
                        strokeWidth={1.3}
                      />
                      <span className="flex-1 truncate">{doc.name}</span>
                      <span
                        className="h-eyebrow"
                        style={{
                          color:
                            "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                        }}
                      >
                        {getDocumentTypeLabel(doc.type)}
                      </span>
                    </a>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <Reveal as="div" kind="scale" delay={200} duration={1000} className="mt-12">
                <div
                  className="h-eyebrow mb-5"
                  style={{ color: "var(--cobalt)" }}
                >
                  ¶ Localisation
                </div>
                <PropertyLocation
                  latitude={property.latitude}
                  longitude={property.longitude}
                  address={`${property.address}, ${property.city}${property.postal_code ? ` (${property.postal_code})` : ""}`}
                />
              </Reveal>
            )}
          </div>

          {/* Aside sticky */}
          <Reveal as="aside" kind="slide-left" delay={120} className="lg:col-span-4">
            <div className="lg:sticky lg:top-[100px] space-y-6">
              <div
                className="p-6"
                style={{
                  background: "var(--ivory-raw)",
                  border: "1px solid var(--bone-raw)",
                }}
              >
                <div
                  className="h-eyebrow mb-4"
                  style={{ color: "var(--cobalt)" }}
                >
                  ¶ Votre conseil
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="placeholder-photo p-dusk w-16 h-16 rounded-full overflow-hidden shrink-0"
                    data-label=""
                    style={
                      agent?.photo_url
                        ? {
                            backgroundImage: `url(${agent.photo_url})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  />
                  <div>
                    <div
                      className="h-caps"
                      style={{ fontSize: 13, letterSpacing: "0.26em" }}
                    >
                      {agentName}
                    </div>
                    <div
                      className="h-eyebrow mt-1"
                      style={{
                        color:
                          "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                      }}
                    >
                      {agentRole}
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2.5 text-[13px]">
                  {agentPhone && (
                    <a
                      href={`tel:${agentPhone.replace(/\s/g, "")}`}
                      className="flex items-center gap-3 hover:text-[color:var(--cobalt)] transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {agentPhone}
                    </a>
                  )}
                  {agentEmail && (
                    <a
                      href={`mailto:${agentEmail}`}
                      className="flex items-center gap-3 hover:text-[color:var(--cobalt)] transition-colors truncate"
                    >
                      <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span className="truncate">{agentEmail}</span>
                    </a>
                  )}
                  <div
                    className="flex items-center gap-3"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {clientConfig.primaryDomain}
                  </div>
                </div>

                <div className="mt-6">
                  {isSold ? (
                    <Link
                      href="/biens"
                      className="w-full btn-ink justify-center inline-flex items-center gap-2"
                    >
                      <span className="relative z-[1] inline-flex items-center gap-2">
                        Voir nos biens disponibles
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </span>
                    </Link>
                  ) : (
                    <VisitRequestDrawer
                      propertyId={property.id}
                      propertyTitle={property.title}
                      propertyRef={refStr}
                      className="w-full btn-ink justify-center"
                      label={`Contacter ${agent?.first_name || clientConfig.agencyName}`}
                    />
                  )}
                </div>
              </div>

              {/* Simulation mensuelle */}
              {!isRent && property.price > 0 && (
                <div
                  className="p-6"
                  style={{ border: "1px solid var(--bone-raw)" }}
                >
                  <MortgageCalculatorEditorial
                    propertyPrice={property.price}
                  />
                </div>
              )}

              {/* Cartouche — Passez au Cabinet */}
              <div className="cartouche" style={{ padding: "24px 24px 22px" }}>
                <div className="cartouche-inner text-white text-center">
                  <div
                    className="h-caps"
                    style={{ fontSize: 14, letterSpacing: "0.32em" }}
                  >
                    Passez au Cabinet
                  </div>
                  <AddressLink
                    address={clientConfig.contact.addressShort}
                    city="Paris"
                    postalCode="75116"
                    href={clientConfig.contact.mapsUrl}
                    unstyled
                    className="block mt-3 mono text-[10px] tracking-[0.22em] uppercase no-underline hover:opacity-100 transition-opacity"
                  >
                    <span style={{ color: "rgba(255,255,255,0.85)" }}>
                      {clientConfig.contact.addressShort}
                      <br />
                      {clientConfig.logoSubtitle}
                    </span>
                  </AddressLink>
                  {clientConfig.contact.mapsUrl && (
                    <a
                      href={clientConfig.contact.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-5 px-4 py-2 text-[11px] tracking-[0.18em] uppercase"
                      style={{
                        border: "1px solid white",
                        color: "white",
                      }}
                    >
                      Itinéraire
                      <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </div>

              {isRent && (
                <div
                  className="p-5 text-xs leading-relaxed"
                  style={{
                    background: "var(--ivory-raw)",
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Honoraires locataire plafonnés selon décret 2014-890.
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Similar properties */}
      <SimilarProperties
        type={property.type}
        transactionType={property.transaction_type}
        city={property.city}
        currentId={property.id}
      />
    </div>
  );
}

type Metric = {
  icon: React.ReactElement;
  v: string;
  u: string;
  l: string;
};

function buildMetrics(property: PropertyWithMedia): Metric[] {
  const items: Metric[] = [];
  if (property.surface > 0) {
    items.push({
      icon: <Square className="h-5 w-5" strokeWidth={1.5} />,
      v: String(property.surface),
      u: "m²",
      l: "Surface",
    });
  }
  if (property.rooms > 0) {
    items.push({
      icon: <DoorOpen className="h-5 w-5" strokeWidth={1.5} />,
      v: String(property.rooms),
      u: "",
      l: "Pièces",
    });
  }
  if (property.bedrooms > 0) {
    items.push({
      icon: <Bed className="h-5 w-5" strokeWidth={1.5} />,
      v: String(property.bedrooms),
      u: "",
      l: "Chambres",
    });
  }
  if (property.bathrooms > 0) {
    items.push({
      icon: <Bath className="h-5 w-5" strokeWidth={1.5} />,
      v: String(property.bathrooms),
      u: "",
      l: "SDB",
    });
  }
  if (property.energy_rating) {
    items.push({
      icon: <Leaf className="h-5 w-5" strokeWidth={1.5} />,
      v: property.energy_rating,
      u: "",
      l: "DPE",
    });
  }
  if (property.construction_year) {
    items.push({
      icon: <Flame className="h-5 w-5" strokeWidth={1.5} />,
      v: String(property.construction_year),
      u: "",
      l: "Construction",
    });
  }
  return items;
}

function DpeGauge({ label, active }: { label: string; active: string }) {
  return (
    <div>
      <div className="h-small-caps mb-3">{label}</div>
      <div className="flex items-center gap-1">
        {"ABCDEFG".split("").map((l) => {
          const isActive = l === active;
          return (
            <div
              key={l}
              className="flex-1 text-center py-3 h-small-caps tabular"
              style={{
                background: isActive ? "var(--cobalt)" : "transparent",
                color: isActive ? "white" : "var(--ink-raw)",
                border: "1px solid var(--bone-raw)",
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </div>
  );
}

async function SimilarProperties({
  type,
  transactionType,
  city,
  currentId,
}: {
  type: string;
  transactionType: string;
  city: string;
  currentId: string;
}) {
  const similar = await getSimilarProperties(
    type,
    transactionType,
    city,
    currentId,
  );

  if (similar.length === 0) return null;

  return (
    <section
      className="max-w-[1440px] mx-auto px-6 lg:px-10 py-20"
      style={{ borderTop: "1px solid var(--bone-raw)" }}
    >
      <Reveal as="div" kind="slide-up" delay={50} className="flex items-end justify-between mb-10 flex-wrap gap-6">
        <div>
          <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 02 — À voir également</div>
          <h2
            className="h-display"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Biens{" "}
            <em className="h-italic" style={{ color: "var(--cobalt)" }}>
              similaires
            </em>
          </h2>
        </div>
        <Link href="/biens" className="link-under group">
          <span className="link-underline-thick">Tout le catalogue</span>
          <ArrowRight className="inline-block h-3 w-3 ml-2 group-arrow" strokeWidth={1.5} />
        </Link>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-x-8 gap-y-14">
        {similar.map((property: PropertyWithMedia, i: number) => (
          <Reveal
            key={property.id}
            kind="scale"
            delay={i * 100}
            duration={800}
            as="div"
          >
            <PropertyCardMagazine
              property={property}
              index={i}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
