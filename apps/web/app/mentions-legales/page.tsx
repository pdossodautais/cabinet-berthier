import { getSettings } from "@/lib/data";
import type { Metadata } from "next";
import { clientConfig } from "@repo/shared/client-config";
import { Reveal } from "@/components/reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Informations légales conformes à la loi n° 2004-575 du 21 juin 2004.",
  alternates: { canonical: "/mentions-legales" },
};

export default async function MentionsLegalesPage() {
  const s = await getSettings();
  const agencyName = s.agency_name || clientConfig.agencyFullName;
  const phone = s.agency_phone || clientConfig.contact.phone;
  const email = s.agency_email || clientConfig.contact.email;
  const address = s.agency_address || clientConfig.contact.address;

  const sections: { t: string; body: string[] }[] = [
    {
      t: "Éditeur du site",
      body: [
        `${agencyName} — enseigne commerciale ${clientConfig.agencyName}`,
        "Société à responsabilité limitée (SARL)",
        address,
        "Directeur de la publication : Julien Berthier, gérant",
        `Téléphone : ${phone} · Email : ${email}`,
        `Société fondée en ${clientConfig.foundedYear}`,
      ],
    },
    {
      t: "Activité réglementée",
      body: [
        "Activité de transaction et de gestion immobilière régie par la loi n° 70-9 du 2 janvier 1970 (loi Hoguet).",
        "Carte professionnelle délivrée par la CCI Paris Île-de-France.",
        "Numéro de carte professionnelle : à compléter lors de la mise en ligne.",
        "Garantie financière : Galian, 89 rue de la Boétie, 75008 Paris — 500 000 €.",
        "Responsabilité civile professionnelle : MMA IARD, 14 boulevard Marie et Alexandre Oyon, 72030 Le Mans Cedex.",
      ],
    },
    {
      t: "Hébergement",
      body: [
        `Le site ${clientConfig.primaryDomain} est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.`,
      ],
    },
    {
      t: "Propriété intellectuelle",
      body: [
        `L'ensemble des contenus (textes, photographies, logos, mise en page) présents sur ce site sont la propriété exclusive de ${clientConfig.agencyName}, sauf mentions particulières.`,
        "Toute reproduction, totale ou partielle, est strictement interdite sans autorisation écrite préalable.",
      ],
    },
    {
      t: "Données personnelles",
      body: [
        `Les informations recueillies via les formulaires sont traitées par ${clientConfig.agencyName} pour répondre à vos demandes.`,
        "Conformément au RGPD et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'opposition et d'effacement de vos données.",
        `Pour exercer ces droits : ${email}.`,
        "Vos données sont conservées trois ans à compter du dernier contact.",
      ],
    },
    {
      t: "Cookies",
      body: [
        "Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire ou de traçage tiers n'est déposé.",
      ],
    },
    {
      t: "Médiation",
      body: [
        "Conformément à l'article L.612-1 du Code de la consommation, le client peut recourir gratuitement au service de médiation de la consommation en cas de litige.",
        "Médiateur : Médiateur de la consommation FNAIM, 129 rue du Faubourg Saint-Honoré, 75008 Paris.",
      ],
    },
  ];

  return (
    <div>
      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 01 — Mentions légales</div>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <Reveal kind="slide-up" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(48px, 7vw, 108px)" }}
            >
              Mentions
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                légales.
              </em>
            </h1>
          </Reveal>
          <Reveal kind="slide-up" delay={100} className="lg:col-span-5">
            <p
              className="text-[15px] leading-[1.7]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
              }}
            >
              Informations légales conformes à la loi n° 2004-575 du 21 juin
              2004 pour la confiance dans l&apos;économie numérique.
            </p>
          </Reveal>
        </div>
      </section>

      <Reveal
        as="section"
        kind="slide-up"
        delay={100}
        className="max-w-[900px] mx-auto px-6 lg:px-10 pb-28 space-y-12 text-[15px] leading-[1.75]"
      >
        <div
          className="space-y-12"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 85%, transparent)",
          }}
        >
          {sections.map((sec) => (
            <div key={sec.t} className="pt-8 rule">
              <div
                className="h-eyebrow mb-4"
                style={{ color: "var(--cobalt)" }}
              >
                {sec.t}
              </div>
              <div className="space-y-3">
                {sec.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
