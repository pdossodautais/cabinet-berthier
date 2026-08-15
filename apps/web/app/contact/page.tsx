import { getAboutData } from "@/lib/data";
import { ContactFormContextual } from "@/components/contact-form-contextual";
import { AddressLink } from "@/components/address-link";
import { Reveal } from "@/components/reveal";
import { Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { clientConfig } from "@repo/shared/client-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description: `Contactez ${clientConfig.agencyFullName}.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${clientConfig.agencyFullName}`,
    description: `Contactez ${clientConfig.agencyFullName}.`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

export default async function ContactPage() {
  const { settings: s, agents } = await getAboutData();

  const agencyName = s.agency_name || clientConfig.agencyFullName;
  const phone = s.agency_phone || clientConfig.contact.phone;
  const email = s.agency_email || clientConfig.contact.email;
  const address = s.agency_address || clientConfig.contact.address;
  const mapsUrl = s.agency_maps_url || clientConfig.contact.mapsUrl;
  const hours = s.agency_hours || clientConfig.contact.hours;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agencyName,
    ...(address && {
      address: { "@type": "PostalAddress", streetAddress: address },
    }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(hours && { openingHours: hours }),
    ...(process.env.NEXT_PUBLIC_SITE_URL && {
      url: process.env.NEXT_PUBLIC_SITE_URL,
    }),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-10 sm:pt-14 pb-10 sm:pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Contact</div>
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-10 items-end">
          <Reveal kind="mask-y" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(40px, 7vw, 108px)", lineHeight: 1.02 }}
            >
              Passez au
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                Cabinet.
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
              Un échange direct avec l&apos;équipe — par écrit, par téléphone,
              ou en franchissant la porte du{" "}
              {clientConfig.contact.addressShort}.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Form + aside */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-28">
        <div
          className="grid lg:grid-cols-12 gap-0"
          style={{ border: "1px solid var(--bone-raw)" }}
        >
          {/* Form */}
          <Reveal
            kind="slide-right"
            className="lg:col-span-7"
          >
            <div
              className="p-5 sm:p-8 lg:p-14"
              style={{ background: "var(--paper-raw)" }}
            >
              <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 02 — Vous écrire</div>
              <ContactFormContextual />
            </div>
          </Reveal>

          {/* Aside */}
          <Reveal
            kind="slide-left"
            delay={120}
            className="lg:col-span-5"
          >
            <aside
              className="border-t lg:border-t-0 lg:border-l h-full"
              style={{
                background: "var(--ivory-raw)",
                borderColor: "var(--bone-raw)",
              }}
            >
            <div className="p-5 sm:p-8 lg:p-12 lg:sticky lg:top-24">
              <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 03 — Nous trouver</div>

              <div
                className="cartouche mb-10"
                style={{ padding: "26px 22px 22px" }}
              >
                <div className="cartouche-inner text-center">
                  <div
                    className="h-caps text-white"
                    style={{ fontSize: 18, letterSpacing: "0.36em" }}
                  >
                    {clientConfig.agencyName}
                  </div>
                  <div
                    className="mt-3 mono text-[9px] tracking-[0.22em] uppercase"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    Transactions immobilières
                    <br />
                    {clientConfig.contact.addressShort} · {clientConfig.logoSubtitle}
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-[14px]">
                <Reveal kind="scale" delay={0}>
                  <ContactRow
                    icon={<MapPin className="h-4 w-4" strokeWidth={1.5} />}
                    label="Adresse"
                  >
                    <AddressLink
                      address={clientConfig.contact.addressShort}
                      city="Paris"
                      postalCode="75116"
                      href={mapsUrl}
                      unstyled
                      className="hover:text-[color:var(--cobalt)] transition-colors no-underline"
                    >
                      {clientConfig.contact.addressShort}
                      <br />
                      75116 Paris
                    </AddressLink>
                  </ContactRow>
                </Reveal>
                <Reveal kind="scale" delay={80}>
                  <ContactRow
                    icon={<Phone className="h-4 w-4" strokeWidth={1.5} />}
                    label="Téléphone"
                  >
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="tabular link-underline-anim hover:text-[color:var(--cobalt)] transition-colors"
                    >
                      {phone}
                    </a>
                  </ContactRow>
                </Reveal>
                <Reveal kind="scale" delay={160}>
                  <ContactRow
                    icon={<Mail className="h-4 w-4" strokeWidth={1.5} />}
                    label="Email"
                  >
                    <a
                      href={`mailto:${email}`}
                      className="link-underline-anim hover:text-[color:var(--cobalt)] transition-colors break-all"
                    >
                      {email}
                    </a>
                  </ContactRow>
                </Reveal>
                <Reveal kind="scale" delay={240}>
                  <ContactRow
                    icon={<Clock className="h-4 w-4" strokeWidth={1.5} />}
                    label="Horaires"
                  >
                    {hours}
                  </ContactRow>
                </Reveal>
              </div>

              {agents.length > 0 && (
                <div className="mt-10 pt-8 rule">
                  <div
                    className="h-eyebrow mb-5"
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                    }}
                  >
                    Votre interlocuteur au Cabinet
                  </div>
                  <div>
                    {agents.map((a, i) => (
                      <div
                        key={a.id}
                        className={`py-3 flex items-center gap-4 ${i > 0 ? "rule" : ""}`}
                      >
                        <span
                          className="w-6 h-px shrink-0"
                          style={{ background: "var(--cobalt)" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="h-caps text-[12px] tracking-[0.26em]">
                            {a.first_name} {a.last_name}
                          </div>
                          {a.phone && (
                            <a
                              href={`tel:${a.phone.replace(/\s/g, "")}`}
                              className="h-eyebrow mt-1 tabular inline-block hover:text-[color:var(--cobalt)] transition-colors"
                              style={{
                                color:
                                  "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                              }}
                            >
                              {a.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manifesto signature */}
              <div className="mt-10 pt-8 rule">
                <div
                  className="h-italic text-[17px] leading-[1.55]"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 80%, transparent)",
                  }}
                >
                  «&nbsp;Nous répondons à chaque message en personne, jamais par
                  un automate. Les associés vous rappellent dans la
                  journée.&nbsp;»
                </div>
                <div
                  className="h-eyebrow mt-4"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  — Le Cabinet, depuis {clientConfig.foundedYear}
                </div>
              </div>

              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-10 inline-flex items-center gap-2 link-under link-underline-anim hover:text-[color:var(--cobalt)] transition-colors"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                  }}
                >
                  Voir sur Google Maps
                  <ArrowUpRight className="h-3.5 w-3.5 group-arrow" strokeWidth={1.5} />
                </a>
              )}
            </div>
            </aside>
          </Reveal>
        </div>

        {/* Footnote éditoriale */}
        <div
          className="mt-10 flex flex-col md:flex-row justify-between gap-4 text-[11px]"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          <div
            className="mono uppercase tracking-[0.18em]"
            style={{ fontSize: 10 }}
          >
            ¶ Vos données sont traitées conformément au RGPD —{" "}
            <a href="/confidentialite" className="underline hover:text-[color:var(--cobalt)]">
              politique de confidentialité
            </a>
          </div>
          <div
            className="mono uppercase tracking-[0.18em]"
            style={{ fontSize: 10 }}
          >
            Réponse garantie sous 24h ouvrées · Aucun transfert à des tiers
          </div>
        </div>
      </section>

    </div>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div
          className="h-eyebrow mb-1"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          {label}
        </div>
        <div className="text-[14px] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
