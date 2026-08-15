import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clientConfig } from "@repo/shared/client-config";
import { AddressLink } from "./address-link";

type Props = {
  settings: Record<string, string>;
};

export function SiteFooter({ settings }: Props) {
  const year = new Date().getFullYear();
  const agencyName = settings.agency_name || clientConfig.agencyFullName;
  const phone = settings.agency_phone || clientConfig.contact.phone;
  const email = settings.agency_email || clientConfig.contact.email;
  const addr = settings.agency_address || clientConfig.contact.address;
  const mapsUrl = settings.agency_maps_url || clientConfig.contact.mapsUrl;
  const hours = settings.agency_hours || clientConfig.contact.hours;

  return (
    <footer
      className="mt-24"
      style={{ background: "var(--ink-raw)", color: "var(--paper-raw)" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-20 pb-10">
        {/* Top band — large manifeste + cartouche devanture */}
        <div
          className="grid lg:grid-cols-12 gap-10 pb-16"
          style={{ borderBottom: "1px solid rgba(244,237,224,0.15)" }}
        >
          <div className="lg:col-span-6">
            <div
              className="h-eyebrow mb-8"
              style={{ color: "rgba(244,237,224,0.6)" }}
            >
              ¶ {clientConfig.agencyName} — depuis {clientConfig.foundedYear}
            </div>
            <div
              className="h-display"
              style={{
                fontSize: "clamp(42px, 6vw, 84px)",
                color: "var(--paper-raw)",
                lineHeight: 1,
              }}
            >
              L&apos;adresse du
              <br />
              <em className="h-italic" style={{ color: "#d9c695" }}>
                {clientConfig.logoSubtitle}.
              </em>
            </div>
            <p
              className="mt-8 max-w-md text-[15px] leading-relaxed"
              style={{ color: "rgba(244,237,224,0.75)" }}
            >
              Transactions, location et gestion d&apos;appartements, hôtels
              particuliers, bureaux et commerces. Paris intra-muros, clientèle
              fidèle depuis {clientConfig.foundedYear}.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="group btn-shimmer inline-flex items-center gap-3 px-5 py-3 text-[12px] uppercase tracking-[0.2em] transition-opacity hover:opacity-95"
                style={{
                  background: "var(--paper-raw)",
                  color: "var(--ink-raw)",
                }}
              >
                <span className="relative z-[1]">Prendre rendez-vous</span>
                <ArrowRight className="h-3.5 w-3.5 group-arrow relative z-[1]" strokeWidth={1.5} />
              </Link>
              <Link
                href="/biens"
                className="group inline-flex items-center gap-3 px-5 py-3 text-[12px] uppercase tracking-[0.2em] transition-colors hover:bg-[rgba(244,237,224,0.08)] hover:border-[rgba(244,237,224,0.5)]"
                style={{
                  border: "1px solid rgba(244,237,224,0.25)",
                  color: "var(--paper-raw)",
                }}
              >
                Voir les biens
                <ArrowRight className="h-3.5 w-3.5 group-arrow" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pl-10">
            {/* Mini devanture cartouche */}
            <div className="cartouche" style={{ padding: "28px 28px 24px" }}>
              <div className="cartouche-inner">
                <div
                  className="h-caps text-center"
                  style={{
                    fontSize: 26,
                    letterSpacing: "0.36em",
                    color: "white",
                  }}
                >
                  Cabinet
                </div>
                <div
                  className="h-caps text-center"
                  style={{
                    fontSize: 26,
                    letterSpacing: "0.36em",
                    color: "white",
                    marginTop: 6,
                  }}
                >
                  Berthier
                </div>
                <div
                  className="mt-5 text-center"
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  Transactions Immobilières
                  <br />
                  {clientConfig.contact.addressShort} · {clientConfig.logoSubtitle}
                </div>
              </div>
            </div>

            <div
              className="mt-10 grid grid-cols-2 gap-6 text-[13px] leading-relaxed"
              style={{ color: "rgba(244,237,224,0.85)" }}
            >
              <div>
                <div
                  className="h-eyebrow mb-3"
                  style={{ color: "rgba(244,237,224,0.5)" }}
                >
                  Adresse
                </div>
                <AddressLink
                  address={addr}
                  href={mapsUrl}
                  unstyled
                  className="nav-underline inline-block hover:text-[color:var(--paper-raw)] transition-colors no-underline"
                >
                  {addr}
                </AddressLink>
              </div>
              <div>
                <div
                  className="h-eyebrow mb-3"
                  style={{ color: "rgba(244,237,224,0.5)" }}
                >
                  Contact
                </div>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="nav-underline inline-flex items-center min-h-[28px] py-0.5 hover:text-[color:var(--paper-raw)] transition-colors"
                >
                  {phone}
                </a>
                <br />
                <a
                  href={`mailto:${email}`}
                  className="nav-underline inline-flex items-center min-h-[28px] py-0.5 max-w-full hover:text-[color:var(--paper-raw)] transition-colors truncate"
                >
                  {email}
                </a>
              </div>
              <div>
                <div
                  className="h-eyebrow mb-3"
                  style={{ color: "rgba(244,237,224,0.5)" }}
                >
                  Horaires
                </div>
                {hours}
              </div>
              <div>
                <div
                  className="h-eyebrow mb-3"
                  style={{ color: "rgba(244,237,224,0.5)" }}
                >
                  Carte professionnelle
                </div>
                <span className="whitespace-nowrap">CPI 7501 0000 000 000 000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom band */}
        <div
          className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] tracking-[0.16em] uppercase"
          style={{ color: "rgba(244,237,224,0.6)" }}
        >
          <div>
            © {year} {agencyName} — Carte professionnelle CPI 7501 0000 000 000 000
          </div>
          <div className="flex gap-6 flex-wrap">
            <Link
              href="/honoraires"
              className="nav-underline transition-colors hover:text-[color:var(--paper-raw)]"
            >
              Honoraires
            </Link>
            <Link
              href="/mentions-legales"
              className="nav-underline transition-colors hover:text-[color:var(--paper-raw)]"
            >
              Mentions légales
            </Link>
            <Link
              href="/confidentialite"
              className="nav-underline transition-colors hover:text-[color:var(--paper-raw)]"
            >
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
