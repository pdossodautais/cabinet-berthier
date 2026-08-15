import { getSettings } from "@/lib/data";
import type { Metadata } from "next";
import { clientConfig } from "@repo/shared/client-config";
import { Reveal } from "@/components/reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité et protection des données personnelles.",
  alternates: { canonical: "/confidentialite" },
};

export default async function ConfidentialitePage() {
  const s = await getSettings();
  const agencyName = s.agency_name || clientConfig.agencyFullName;
  const contactEmail = s.agency_email || clientConfig.contact.email;
  const address = s.agency_address || clientConfig.contact.address;

  const sections: {
    t: string;
    body?: string[];
    list?: string[];
    after?: string[];
  }[] = [
    {
      t: "Responsable du traitement",
      body: [
        `Le responsable du traitement des données personnelles est ${agencyName}.`,
        `Adresse : ${address}`,
        `Email : ${contactEmail}`,
      ],
    },
    {
      t: "Données collectées",
      body: [
        "Dans le cadre de l'utilisation de notre site, nous collectons les données personnelles suivantes :",
      ],
      list: [
        "Nom et prénom",
        "Adresse email",
        "Numéro de téléphone",
        "Message (formulaire de contact)",
      ],
      after: [
        "Ces données sont collectées via les formulaires de contact, de demande d'estimation et d'inscription aux alertes immobilières.",
      ],
    },
    {
      t: "Finalité du traitement",
      body: ["Les données collectées sont utilisées pour :"],
      list: [
        "Répondre à vos demandes de contact et de renseignements",
        "Traiter vos demandes d'estimation immobilière",
        "Vous envoyer des alertes immobilières correspondant à vos critères",
        "Assurer le suivi de la relation commerciale",
      ],
    },
    {
      t: "Durée de conservation",
      body: [
        "Vos données personnelles sont conservées pour une durée maximale de 3 ans à compter de votre dernier contact avec notre cabinet. Au-delà, vos données seront supprimées ou anonymisées.",
      ],
    },
    {
      t: "Vos droits (RGPD)",
      body: [
        "Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :",
      ],
      list: [
        "Droit d'accès — obtenir la confirmation que vos données sont traitées",
        "Droit de rectification — corriger des données inexactes",
        "Droit de suppression — effacer vos données personnelles",
        "Droit à la portabilité — recevoir vos données dans un format structuré",
        "Droit d'opposition — vous opposer au traitement pour motifs légitimes",
        "Droit à la limitation — restreindre le traitement de vos données",
      ],
      after: [
        `Pour exercer ces droits : ${contactEmail}.`,
        "Vous disposez également du droit d'introduire une réclamation auprès de la CNIL.",
      ],
    },
    {
      t: "Sous-traitants",
      body: [
        "Nous faisons appel aux sous-traitants suivants pour le traitement de vos données :",
      ],
      list: [
        "Supabase — hébergement et stockage des données",
        "Resend — envoi d'emails transactionnels et de notifications",
      ],
      after: [
        "Ces sous-traitants sont soumis à des obligations contractuelles garantissant la sécurité et la confidentialité de vos données.",
      ],
    },
    {
      t: "Cookies",
      body: [
        "Ce site utilise uniquement des cookies techniques nécessaires à son bon fonctionnement. Aucun cookie publicitaire ou de traçage tiers n'est déposé.",
      ],
    },
  ];

  return (
    <div>
      {/* Head */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-10 pt-14 pb-14">
        <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 02 — Données personnelles</div>
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <Reveal kind="slide-up" className="lg:col-span-7">
            <h1
              className="h-display"
              style={{ fontSize: "clamp(48px, 7vw, 108px)" }}
            >
              Politique de
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                confidentialité.
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
              Transparence sur les données que nous collectons, comment elles
              sont traitées et vos droits conformément au RGPD.
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
                {sec.body?.map((p, i) => <p key={i}>{p}</p>)}
                {sec.list && (
                  <ul className="space-y-2 pt-2">
                    {sec.list.map((it, j) => (
                      <li key={j} className="flex gap-4">
                        <span
                          className="mono text-[12px] tabular pt-1.5 shrink-0"
                          style={{ color: "var(--cobalt)" }}
                        >
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sec.after?.map((p, i) => <p key={`a-${i}`}>{p}</p>)}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
