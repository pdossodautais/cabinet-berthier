"use client";

import { useState, useTransition, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { submitContactForm } from "@/lib/actions/contacts";
import { clientConfig } from "@repo/shared/client-config";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

const clientConfigName = clientConfig.agencyFullName;

type DeptKey = "vente" | "achat" | "location" | "gestion" | "autre";

type DeptConfig = {
  label: string;
  eyebrow: string;
  title: string;
  italic: string;
  lede: string;
  signedBy: string;
  signedRole: string;
  cta: { label: string; sub: string };
  altCta?: { label: string; href: string };
  fields: string[];
  messagePh: string;
};

const DEPTS: Record<DeptKey, DeptConfig> = {
  vente: {
    label: "Vente",
    eyebrow: "Vous souhaitez vendre",
    title: "Confier votre bien",
    italic: "au Cabinet.",
    lede: "Visite d'estimation offerte sous 72h par un associé, mandat à votre main (exclusif, semi-exclusif ou simple), et mise en marché dans les dix jours.",
    signedBy: "Julien Berthier",
    signedRole: "Gérant · Vente",
    cta: {
      label: "Envoyer la demande",
      sub: "Réponse personnalisée sous 24h ouvrées",
    },
    altCta: { label: "Ou lancer une estimation en ligne", href: "/estimation" },
    fields: ["address", "type", "surface", "rooms", "timing", "message"],
    messagePh:
      "Historique du bien, particularités, motif de vente, prix souhaité…",
  },
  achat: {
    label: "Achat",
    eyebrow: "Vous cherchez à acquérir",
    title: "Trouver votre",
    italic: "prochaine adresse.",
    lede: "Un associé vous accompagne de la définition du cahier des charges à la signature. Accès prioritaire aux biens hors marché, visites organisées, négociation menée pour vous.",
    signedBy: "Julien Berthier",
    signedRole: "Gérant · Acquisition",
    cta: {
      label: "Lancer ma recherche",
      sub: "Premiers biens adressés sous 48h",
    },
    altCta: { label: "Voir les biens à vendre", href: "/biens?tx=vente" },
    fields: ["budget", "type", "rooms", "quartiers", "timing", "usage", "message"],
    messagePh:
      "Usage du bien (résidence principale, pied-à-terre, investissement), profil patrimonial, critères essentiels, étages, exposition, travaux acceptés ou non…",
  },
  location: {
    label: "Location",
    eyebrow: "Vous cherchez à louer",
    title: "Trouver votre",
    italic: "prochaine adresse.",
    lede: "Décrivez-nous le bien idéal. Vous recevez les annonces qui correspondent avant leur mise en ligne publique, et visitez avec un associé.",
    signedBy: "Julien Berthier",
    signedRole: "Gérant · Location",
    cta: { label: "Créer mon alerte", sub: "Premiers biens envoyés sous 48h" },
    fields: ["budget", "rooms", "quartiers", "movein", "furnished", "message"],
    messagePh:
      "Profil du foyer, revenus mensuels, situation professionnelle, souhaits particuliers…",
  },
  gestion: {
    label: "Gestion",
    eyebrow: "Vous êtes propriétaire bailleur",
    title: "Déléguer la",
    italic: "gestion.",
    lede: "Encaissement des loyers, révisions annuelles, gestion technique, garantie loyers impayés — trois formules au choix, mandat résiliable chaque année.",
    signedBy: "Julien Berthier",
    signedRole: "Gérant · Gestion",
    cta: {
      label: "Recevoir une proposition",
      sub: "Devis personnalisé sous 48h",
    },
    fields: ["address", "type", "surface", "currentStatus", "formule", "message"],
    messagePh:
      "Nombre de lots à gérer, état actuel (loué/vacant), gestionnaire actuel le cas échéant…",
  },
  autre: {
    label: "Autre",
    eyebrow: "Autre sujet",
    title: "Nous écrire",
    italic: "directement.",
    lede: "Presse, partenariat, candidature spontanée, ou simple question. Un associé vous répond personnellement.",
    signedBy: "Secrétariat du Cabinet",
    signedRole: "",
    cta: { label: "Envoyer le message", sub: "Réponse sous 3 jours ouvrés" },
    fields: ["subject", "message"],
    messagePh: "Votre message…",
  },
};

const PROPERTY_NATURES = [
  "Appartement",
  "Maison",
  "Hôtel particulier",
  "Immeuble de rapport",
  "Bureaux",
  "Commerce",
  "Parking / cave",
];

const ROOM_OPTIONS = [
  "Studio",
  "2 pièces",
  "3 pièces",
  "4 pièces",
  "5 pièces",
  "6 pièces et +",
];

const QUARTIERS = [
  "Trocadéro",
  "Passy",
  "Chaillot",
  "Muette",
  "Auteuil",
  "Étoile",
  "Monceau",
  "St-Germain",
];

const SUBJECTS = [
  "Presse & relations médias",
  "Partenariat professionnel",
  "Candidature spontanée",
  "Question générale",
  "Autre",
];

const TIMING = [
  { v: "immediat", l: "Dans le mois" },
  { v: "3-6mois", l: "Sous 6 mois" },
  { v: "6-12mois", l: "Dans l'année" },
  { v: "info", l: "Simple info" },
];

const USAGE = [
  { v: "residence", l: "Résidence principale" },
  { v: "pied-a-terre", l: "Pied-à-terre" },
  { v: "investissement", l: "Investissement locatif" },
  { v: "indifferent", l: "À déterminer" },
];

const MOVEIN = [
  { v: "asap", l: "Dès que possible" },
  { v: "1mo", l: "Dans 1 mois" },
  { v: "3mo", l: "Dans 3 mois" },
  { v: "flex", l: "Flexible" },
];

const FURNISHED = [
  { v: "vide", l: "Vide" },
  { v: "meuble", l: "Meublé" },
  { v: "indifferent", l: "Indifférent" },
];

const CURRENT_STATUS = [
  { v: "occupe", l: "Occupé" },
  { v: "vacant", l: "Vacant" },
  { v: "en-recherche", l: "En recherche de locataire" },
];

const FORMULE = [
  { v: "standard", l: "Standard — 6 %" },
  { v: "complete", l: "Complète — 8 %" },
  { v: "premium", l: "Premium — 10 %" },
  { v: "sans-avis", l: "Sans avis" },
];

const inputCls =
  "w-full !min-h-11 px-4 py-3 bg-transparent border text-[16px] rounded-none focus:outline-none focus:border-[color:var(--cobalt)] transition-colors duration-200";
const labelCls = "block h-eyebrow mb-2";

export function ContactFormContextual() {
  const [dept, setDept] = useState<DeptKey>("vente");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ts] = useState(() => Date.now());

  const D = DEPTS[dept];
  const has = (f: string) => D.fields.includes(f);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailField, setEmailField] = useState("");
  const [phoneField, setPhoneField] = useState("");
  const [messageField, setMessageField] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [address, setAddress] = useState("");
  const [nature, setNature] = useState(PROPERTY_NATURES[0]);
  const [surface, setSurface] = useState("");
  const [rooms, setRooms] = useState(ROOM_OPTIONS[0]);
  const [budget, setBudget] = useState("");
  const [quartiersSel, setQuartiersSel] = useState<string[]>([]);
  const [timing, setTiming] = useState(TIMING[0].v);
  const [movein, setMovein] = useState(MOVEIN[0].v);
  const [furnished, setFurnished] = useState(FURNISHED[0].v);
  const [currentStatus, setCurrentStatus] = useState(CURRENT_STATUS[0].v);
  const [formule, setFormule] = useState(FORMULE[0].v);
  const [usage, setUsage] = useState(USAGE[0].v);
  const [gdpr, setGdpr] = useState(false);

  const toggleQuartier = (q: string) => {
    setQuartiersSel((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q],
    );
  };

  const composedMessage = useMemo(() => {
    const lines: string[] = [`[${D.label}]`];
    if (has("subject")) lines.push(`Sujet : ${subject}`);
    if (has("address") && address) lines.push(`Adresse : ${address}`);
    if (has("type") && nature) lines.push(`Nature : ${nature}`);
    if (has("surface") && surface) lines.push(`Surface : ${surface} m²`);
    if (has("rooms") && rooms) lines.push(`Pièces : ${rooms}`);
    if (has("budget") && budget)
      lines.push(
        `Budget : ${budget} ${dept === "achat" ? "€ (acquisition)" : "€/mois"}`,
      );
    if (has("quartiers") && quartiersSel.length)
      lines.push(`Quartiers : ${quartiersSel.join(", ")}`);
    if (has("timing") && timing)
      lines.push(`Délai : ${TIMING.find((t) => t.v === timing)?.l}`);
    if (has("movein") && movein)
      lines.push(`Emménagement : ${MOVEIN.find((t) => t.v === movein)?.l}`);
    if (has("furnished") && furnished)
      lines.push(
        `Meublé/vide : ${FURNISHED.find((t) => t.v === furnished)?.l}`,
      );
    if (has("currentStatus") && currentStatus)
      lines.push(
        `Statut : ${CURRENT_STATUS.find((t) => t.v === currentStatus)?.l}`,
      );
    if (has("formule") && formule)
      lines.push(`Formule : ${FORMULE.find((t) => t.v === formule)?.l}`);
    if (has("usage") && usage)
      lines.push(`Usage : ${USAGE.find((t) => t.v === usage)?.l}`);
    if (messageField) lines.push("", messageField);
    return lines.join("\n");
  }, [
    D.label,
    D.fields,
    subject,
    address,
    nature,
    surface,
    rooms,
    budget,
    quartiersSel,
    timing,
    movein,
    furnished,
    currentStatus,
    formule,
    usage,
    dept,
    messageField,
    has,
  ]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!gdpr) {
      setError("Veuillez accepter le traitement de vos données.");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("message", composedMessage);
    fd.set("_ts", String(ts));

    startTransition(async () => {
      const result = await submitContactForm(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    });
  };

  if (sent) {
    return (
      <div className="animate-fade-up py-16 text-center">
        <div className="chapter-mark mb-6 justify-center inline-flex animate-eyebrow-in">
          Message envoyé
        </div>
        <h2
          className="h-display mb-5"
          style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          Merci,{" "}
          <em className="h-italic" style={{ color: "var(--cobalt)" }}>
            à très vite.
          </em>
        </h2>
        <p
          className="text-[15px] max-w-md mx-auto"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
          }}
        >
          {D.signedBy} revient vers vous dans les 24 heures ouvrées.
        </p>
        <Button
          type="button"
          onClick={() => {
            setSent(false);
            setMessageField("");
          }}
          variant="ghost"
          className="mt-10 btn-ghost h-auto"
        >
          Nouveau message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      <div className="h-eyebrow mb-6" style={{ color: "var(--cobalt)" }}>
        ¶ Nature de la demande
      </div>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px mb-8"
        style={{ background: "var(--bone-raw)" }}
      >
        {(Object.entries(DEPTS) as [DeptKey, DeptConfig][]).map(([v, d]) => (
          <button
            key={v}
            type="button"
            onClick={() => setDept(v)}
            aria-pressed={dept === v}
            className="min-h-12 px-2 py-3 sm:py-4 h-small-caps text-[11px] sm:text-[12px] transition-colors duration-200 hover:bg-[color:var(--ivory-raw)]"
            style={{
              background: dept === v ? "var(--ink-raw)" : "var(--paper-raw)",
              color: dept === v ? "var(--paper-raw)" : "var(--ink-raw)",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Contextual intro */}
      <div
        key={`dept-intro-${dept}`}
        className="animate-fade-up pb-8 mb-8"
        style={{ borderBottom: "1px solid var(--bone-raw)" }}
      >
        <div className="h-eyebrow mb-3 animate-eyebrow-in" style={{ color: "var(--cobalt)" }}>
          {D.eyebrow}
        </div>
        <h2
          className="h-display mb-3"
          style={{ fontSize: "clamp(26px, 3.6vw, 36px)", lineHeight: 1.05 }}
        >
          {D.title}{" "}
          <em className="h-italic" style={{ color: "var(--cobalt)" }}>
            {D.italic}
          </em>
        </h2>
        <p
          className="text-[14px] leading-[1.7]"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 75%, transparent)",
          }}
        >
          {D.lede}
        </p>
      </div>

      {/* Identity */}
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="first_name" className={labelCls}>
            Prénom
          </label>
          <Input
            id="first_name"
            name="first_name"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Prénom"
            className={inputCls}
            style={{ borderColor: "var(--bone-raw)" }}
          />
        </div>
        <div>
          <label htmlFor="last_name" className={labelCls}>
            Nom
          </label>
          <Input
            id="last_name"
            name="last_name"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nom"
            className={inputCls}
            style={{ borderColor: "var(--bone-raw)" }}
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={emailField}
            onChange={(e) => setEmailField(e.target.value)}
            placeholder="vous@exemple.fr"
            className={inputCls}
            style={{ borderColor: "var(--bone-raw)" }}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>
            Téléphone
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phoneField}
            onChange={(e) => setPhoneField(e.target.value)}
            placeholder="01 23 45 67 89"
            className={inputCls}
            style={{ borderColor: "var(--bone-raw)" }}
          />
        </div>
      </div>

      {/* Contextual */}
      {has("subject") && (
        <div className="mb-5">
          <label htmlFor="subject-sel" className={labelCls}>
            Sujet
          </label>
          <Select value={subject} onValueChange={(v) => v && setSubject(v)}>
            <SelectTrigger
              id="subject-sel"
              className={inputCls}
              style={{ borderColor: "var(--bone-raw)" }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {has("address") && (
        <div className="mb-5">
          <label htmlFor="address-field" className={labelCls}>
            {dept === "gestion"
              ? "Adresse du bien à gérer"
              : dept === "vente"
                ? "Adresse du bien à vendre"
                : "Adresse du bien"}
          </label>
          <Input
            id="address-field"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Numéro, rue, arrondissement (ex. 24 av. Kléber, 75116)"
            className={inputCls}
            style={{ borderColor: "var(--bone-raw)" }}
          />
        </div>
      )}

      {has("type") && (
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label htmlFor="nature" className={labelCls}>
              Nature du bien
            </label>
            <Select value={nature} onValueChange={(v) => v && setNature(v)}>
              <SelectTrigger
                id="nature"
                className={inputCls}
                style={{ borderColor: "var(--bone-raw)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_NATURES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {has("surface") && (
            <div>
              <label htmlFor="surface" className={labelCls}>
                Surface (m²)
              </label>
              <Input
                id="surface"
                type="number"
                inputMode="numeric"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="ex. 120"
                className={inputCls + " tabular"}
                style={{ borderColor: "var(--bone-raw)" }}
              />
            </div>
          )}
        </div>
      )}

      {has("rooms") && !has("type") && (
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label htmlFor="rooms-sel" className={labelCls}>
              Nombre de pièces
            </label>
            <Select value={rooms} onValueChange={(v) => v && setRooms(v)}>
              <SelectTrigger
                id="rooms-sel"
                className={inputCls}
                style={{ borderColor: "var(--bone-raw)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {has("budget") && (
            <div>
              <label htmlFor="budget" className={labelCls}>
                Budget mensuel (€/mois)
              </label>
              <Input
                id="budget"
                type="number"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="ex. 3 500"
                className={inputCls + " tabular"}
                style={{ borderColor: "var(--bone-raw)" }}
              />
            </div>
          )}
        </div>
      )}

      {has("rooms") && has("type") && has("budget") && (
        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label htmlFor="rooms-sel-achat" className={labelCls}>
              Nombre de pièces
            </label>
            <Select value={rooms} onValueChange={(v) => v && setRooms(v)}>
              <SelectTrigger
                id="rooms-sel-achat"
                className={inputCls}
                style={{ borderColor: "var(--bone-raw)" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="budget-achat" className={labelCls}>
              Budget d&apos;acquisition (€)
            </label>
            <Input
              id="budget-achat"
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="ex. 1 500 000"
              className={inputCls + " tabular"}
              style={{ borderColor: "var(--bone-raw)" }}
            />
          </div>
        </div>
      )}

      {has("rooms") && has("type") && !has("budget") && (
        <div className="mb-5">
          <label htmlFor="rooms-single" className={labelCls}>
            Nombre de pièces
          </label>
          <Input
            id="rooms-single"
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
            placeholder="ex. 4"
            className={inputCls}
            style={{ borderColor: "var(--bone-raw)" }}
          />
        </div>
      )}

      {has("quartiers") && (
        <div className="mb-5">
          <div className="h-eyebrow mb-2">Quartiers recherchés</div>
          <div className="flex flex-wrap gap-2">
            {QUARTIERS.map((q) => {
              const active = quartiersSel.includes(q);
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => toggleQuartier(q)}
                  className="tag-hover px-3 py-1.5 text-[12px] tracking-[0.08em] border"
                  style={{
                    borderColor: active ? "var(--cobalt)" : "var(--bone-raw)",
                    background: active ? "var(--cobalt)" : "transparent",
                    color: active ? "white" : "var(--ink-raw)",
                  }}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {has("timing") && (
        <RadioRow
          label={
            dept === "achat"
              ? "Délai d'acquisition souhaité"
              : "Délai de mise en vente"
          }
          value={timing}
          onChange={setTiming}
          options={TIMING}
        />
      )}
      {has("usage") && (
        <RadioRow
          label="Usage du bien"
          value={usage}
          onChange={setUsage}
          options={USAGE}
        />
      )}
      {has("movein") && (
        <RadioRow
          label="Date d'emménagement souhaitée"
          value={movein}
          onChange={setMovein}
          options={MOVEIN}
        />
      )}
      {has("furnished") && (
        <RadioRow
          label="Meublé ou vide"
          value={furnished}
          onChange={setFurnished}
          options={FURNISHED}
        />
      )}
      {has("currentStatus") && (
        <RadioRow
          label="Statut actuel du bien"
          value={currentStatus}
          onChange={setCurrentStatus}
          options={CURRENT_STATUS}
        />
      )}
      {has("formule") && (
        <RadioRow
          label="Formule envisagée"
          value={formule}
          onChange={setFormule}
          options={FORMULE}
        />
      )}

      <div className="mb-5">
        <label htmlFor="message-field" className={labelCls}>
          Votre message
        </label>
        <Textarea
          id="message-field"
          rows={5}
          value={messageField}
          onChange={(e) => setMessageField(e.target.value)}
          placeholder={D.messagePh}
          className={inputCls}
          style={{ borderColor: "var(--bone-raw)" }}
        />
      </div>

      <div
        className="flex items-start gap-3 mt-6 text-[13px] leading-relaxed"
        style={{
          color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
        }}
      >
        <Checkbox
          id="gdpr-contact"
          required
          checked={gdpr}
          onCheckedChange={(c) => setGdpr(Boolean(c))}
          className="mt-1 rounded-none shrink-0"
        />
        <label
          htmlFor="gdpr-contact"
          className="cursor-pointer select-none"
        >
          J&apos;accepte que mes données soient traitées par{" "}
          <span style={{ color: "var(--ink-raw)" }}>
            {clientConfigName}
          </span>{" "}
          pour répondre à ma demande — aucun transfert, aucune newsletter non
          sollicitée.
        </label>
      </div>

      {error && (
        <div
          className="animate-fade-up mt-5 p-4 text-[13px]"
          style={{
            background: "color-mix(in oklch, var(--destructive) 10%, transparent)",
            color: "var(--destructive)",
            border: "1px solid var(--destructive)",
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Submit row */}
      <div
        className="mt-10 pt-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6"
        style={{ borderTop: "1px solid var(--bone-raw)" }}
      >
        <div className="sm:flex-1 sm:min-w-0">
          <div className="h-eyebrow" style={{ color: "var(--cobalt)" }}>
            {D.cta.sub}
          </div>
          <div
            className="h-eyebrow mt-2"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
            }}
          >
            Réponse signée{" "}
            <span style={{ color: "var(--ink-raw)" }}>{D.signedBy}</span>
            {D.signedRole && <> · {D.signedRole}</>}
          </div>
          {D.altCta && (
            <Link
              href={D.altCta.href}
              className="link-under mt-4 inline-flex"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
              }}
            >
              {D.altCta.label}
            </Link>
          )}
        </div>
        <Button
          type="submit"
          disabled={pending}
          variant="ghost"
          className="group btn-ink btn-shimmer disabled:opacity-60 shrink-0 sm:ml-auto h-auto w-full sm:w-auto justify-center"
        >
          <span className="relative z-[1] inline-flex items-center gap-2">
            {pending ? "Envoi…" : D.cta.label}
            <ArrowRight className="h-3.5 w-3.5 group-arrow" strokeWidth={1.5} />
          </span>
        </Button>
      </div>
    </form>
  );
}

function RadioRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { v: string; l: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <div
        className="h-eyebrow mb-3"
        style={{
          color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
        }}
      >
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => onChange(o.v)}
              aria-pressed={active}
              className="tag-hover px-3 py-2 text-[12px] tracking-[0.08em] border"
              style={{
                borderColor: active ? "var(--cobalt)" : "var(--bone-raw)",
                background: active ? "var(--cobalt)" : "transparent",
                color: active ? "white" : "var(--ink-raw)",
              }}
            >
              {o.l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
