"use client";

import { useState, useTransition } from "react";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import Link from "next/link";
import { submitEstimationForm } from "@/lib/actions/estimations";
import { clientConfig } from "@repo/shared/client-config";

type Data = {
  address: string;
  district: string;
  type: string;
  surface: string;
  rooms: string;
  floor: string;
  condition: string;
  features: string[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profile: string;
  gdpr: boolean;
};

const STEPS = [
  "Adresse",
  "Caractéristiques",
  "Prestations",
  "Vos coordonnées",
  "Estimation",
];

const DISTRICTS = ["16ᵉ", "17ᵉ", "8ᵉ", "7ᵉ", "6ᵉ", "14ᵉ", "11ᵉ", "12ᵉ"];

// Mapping UI label → enum DB property_type ('appartement'|'maison'|'terrain'|'commerce'|'bureau').
// Le label UI peut être plus riche que l'enum (ex. "Hôtel particulier" → "maison").
const TYPES = [
  { label: "Appartement", value: "appartement" },
  { label: "Maison", value: "maison" },
  { label: "Hôtel particulier", value: "maison" },
  { label: "Bureaux", value: "bureau" },
  { label: "Commerce", value: "commerce" },
] as const;

const CONDITIONS = [
  { v: "neuf", l: "Neuf / rénové" },
  { v: "bon", l: "Bon état" },
  { v: "rafraichir", l: "À rafraîchir" },
  { v: "travaux", l: "Travaux importants" },
];

const FEATURES_LIST = [
  "Balcon filant",
  "Terrasse",
  "Jardin privatif",
  "Ascenseur",
  "Cave",
  "Parking",
  "Cheminée d'origine",
  "Parquet Versailles",
  "Moulures",
  "Vue dégagée",
  "Traversant",
  "Double exposition",
];

const PROFILES = [
  "Propriétaire — je souhaite vendre",
  "Propriétaire — pour information",
  "Intermédiaire / conseil patrimonial",
];

function fieldInput(value: string, onChange: (v: string) => void, props: Record<string, unknown> = {}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border px-4 py-3 text-[14px] focus:outline-none focus:border-[color:var(--cobalt)] rounded-none transition-colors duration-200"
      style={{ borderColor: "var(--bone-raw)" }}
      {...props}
    />
  );
}

function districtToPostal(district: string): string {
  const m = /^(\d{1,2})/.exec(district);
  if (!m) return "75116";
  return `751${String(Number(m[1])).padStart(2, "0")}`;
}

export function EstimationWizard() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [ts] = useState(() => Date.now());
  const [data, setData] = useState<Data>({
    address: "",
    district: "16ᵉ",
    type: "Appartement",
    surface: "",
    rooms: "",
    floor: "",
    condition: "bon",
    features: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profile: PROFILES[0],
    gdpr: false,
  });

  const set = <K extends keyof Data>(k: K, v: Data[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleFeature = (f: string) =>
    set(
      "features",
      data.features.includes(f)
        ? data.features.filter((x) => x !== f)
        : [...data.features, f],
    );

  const canProceed = (() => {
    if (step === 0) return data.address.trim().length > 0;
    if (step === 1) return Number(data.surface) > 0;
    if (step === 3) {
      return (
        data.firstName.trim() &&
        data.lastName.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
        data.gdpr
      );
    }
    return true;
  })();

  const submit = () => {
    setError(null);
    const fd = new FormData();
    fd.set("first_name", data.firstName);
    fd.set("last_name", data.lastName);
    fd.set("email", data.email);
    if (data.phone) fd.set("phone", data.phone);
    fd.set("address", data.address);
    fd.set("city", "Paris");
    fd.set("postal_code", districtToPostal(data.district));
    fd.set(
      "property_type",
      TYPES.find((t) => t.label === data.type)?.value ?? "appartement",
    );
    if (data.surface) fd.set("surface", data.surface);
    if (data.rooms) fd.set("rooms", data.rooms);
    const messageLines = [
      `[Demande d'estimation — ${data.district} · ${data.type}]`,
      `État : ${CONDITIONS.find((c) => c.v === data.condition)?.l}`,
      data.floor ? `Étage : ${data.floor}` : "",
      data.features.length ? `Atouts : ${data.features.join(", ")}` : "",
      `Profil : ${data.profile}`,
    ].filter(Boolean);
    fd.set("message", messageLines.join("\n"));
    fd.set("_ts", String(ts));

    startTransition(async () => {
      const result = await submitEstimationForm(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
        setStep(4);
      }
    });
  };

  const next = () => {
    if (step === 3) {
      submit();
    } else {
      setStep(Math.min(step + 1, STEPS.length - 1));
    }
  };

  return (
    <>
      {/* Progress */}
      <div className="grid grid-cols-5 gap-1 mb-12">
        {STEPS.map((s, i) => (
          <div key={i} className="relative">
            <div
              className="h-1 transition-colors"
              style={{
                background: i <= step ? "var(--cobalt)" : "var(--bone-raw)",
              }}
            />
            <div className="mt-3 flex items-baseline gap-2">
              <span
                className="h-display tabular"
                style={{
                  fontSize: 22,
                  color:
                    i <= step
                      ? "var(--cobalt)"
                      : "color-mix(in oklch, var(--ink-raw) 35%, transparent)",
                }}
              >
                0{i + 1}
              </span>
              <span
                className="h-small-caps hidden md:inline"
                style={{
                  color:
                    i <= step
                      ? "var(--ink-raw)"
                      : "color-mix(in oklch, var(--ink-raw) 45%, transparent)",
                  fontSize: 10,
                }}
              >
                {s}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="py-6 lg:py-10 min-h-[420px]">
        {step === 0 && (
          <div key="step-0" className="animate-fade-up">
            <h2
              className="h-display mb-8"
              style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
            >
              Où se situe{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                votre bien ?
              </em>
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              <label className="md:col-span-2 block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Adresse
                </div>
                {fieldInput(data.address, (v) => set("address", v), {
                  placeholder: "Numéro, rue",
                  required: true,
                })}
              </label>
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Arrondissement
                </div>
                <select
                  value={data.district}
                  onChange={(e) => set("district", e.target.value)}
                  className="w-full border px-4 py-3 text-[14px] bg-transparent rounded-none"
                  style={{ borderColor: "var(--bone-raw)" }}
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-8">
              <div
                className="h-eyebrow mb-3"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                Nature du bien
              </div>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => {
                  const active = data.type === t.label;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => set("type", t.label)}
                      className="tag-hover px-5 py-3 border text-[13px]"
                      style={{
                        background: active ? "var(--cobalt)" : "transparent",
                        color: active ? "white" : "var(--ink-raw)",
                        borderColor: active ? "var(--cobalt)" : "var(--bone-raw)",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div key="step-1" className="animate-fade-up">
            <h2
              className="h-display mb-8"
              style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
            >
              Décrivez{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                votre bien.
              </em>
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Surface (m²)
                </div>
                {fieldInput(data.surface, (v) => set("surface", v.replace(/[^0-9.,]/g, "")), {
                  placeholder: "ex. 120",
                  inputMode: "numeric",
                })}
              </label>
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Nombre de pièces
                </div>
                {fieldInput(data.rooms, (v) => set("rooms", v.replace(/[^0-9]/g, "")), {
                  placeholder: "ex. 4",
                  inputMode: "numeric",
                })}
              </label>
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Étage
                </div>
                {fieldInput(data.floor, (v) => set("floor", v), {
                  placeholder: "ex. 3ᵉ",
                })}
              </label>
            </div>
            <div className="mt-8">
              <div
                className="h-eyebrow mb-3"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                État général
              </div>
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-0 border"
                style={{ borderColor: "var(--bone-raw)" }}
              >
                {CONDITIONS.map((c, i) => {
                  const active = data.condition === c.v;
                  return (
                    <button
                      key={c.v}
                      type="button"
                      onClick={() => set("condition", c.v)}
                      className="py-5 h-small-caps text-center transition-colors duration-200 hover:bg-[color:var(--ivory-raw)]"
                      style={{
                        background: active ? "var(--ink-raw)" : "transparent",
                        color: active ? "var(--paper-raw)" : "var(--ink-raw)",
                        borderRight:
                          i < CONDITIONS.length - 1
                            ? "1px solid var(--bone-raw)"
                            : "none",
                      }}
                    >
                      {c.l}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="step-2" className="animate-fade-up">
            <h2
              className="h-display mb-8"
              style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
            >
              Les{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                atouts
              </em>{" "}
              du bien.
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {FEATURES_LIST.map((f) => {
                const on = data.features.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFeature(f)}
                    className="tag-hover flex items-center gap-3 p-4 border text-left text-[13px]"
                    style={{
                      background: on ? "var(--ivory-raw)" : "transparent",
                      borderColor: on ? "var(--cobalt)" : "var(--bone-raw)",
                      color: "var(--ink-raw)",
                    }}
                  >
                    <span
                      className="h-5 w-5 border inline-flex items-center justify-center shrink-0"
                      style={{
                        borderColor: on ? "var(--cobalt)" : "var(--ink-raw)",
                        background: on ? "var(--cobalt)" : "transparent",
                        color: "white",
                      }}
                    >
                      {on && <Check className="h-3 w-3" strokeWidth={2.5} />}
                    </span>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div key="step-3" className="animate-fade-up">
            <h2
              className="h-display mb-8"
              style={{ fontSize: "clamp(34px, 5vw, 52px)" }}
            >
              Et{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                vous ?
              </em>
            </h2>
            <div className="grid md:grid-cols-2 gap-5 max-w-[640px]">
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Prénom
                </div>
                {fieldInput(data.firstName, (v) => set("firstName", v), {
                  placeholder: "Votre prénom",
                  autoComplete: "given-name",
                  required: true,
                })}
              </label>
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Nom
                </div>
                {fieldInput(data.lastName, (v) => set("lastName", v), {
                  placeholder: "Votre nom",
                  autoComplete: "family-name",
                  required: true,
                })}
              </label>
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Email
                </div>
                {fieldInput(data.email, (v) => set("email", v), {
                  placeholder: "vous@exemple.fr",
                  type: "email",
                  autoComplete: "email",
                  required: true,
                })}
              </label>
              <label className="block">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Téléphone
                </div>
                {fieldInput(data.phone, (v) => set("phone", v), {
                  placeholder: "06 00 00 00 00",
                  type: "tel",
                  autoComplete: "tel",
                })}
              </label>
              <label className="block md:col-span-2">
                <div
                  className="h-eyebrow mb-2"
                  style={{
                    color:
                      "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                  }}
                >
                  Vous êtes
                </div>
                <select
                  value={data.profile}
                  onChange={(e) => set("profile", e.target.value)}
                  className="w-full bg-transparent border px-4 py-3 text-[14px] rounded-none"
                  style={{ borderColor: "var(--bone-raw)" }}
                >
                  {PROFILES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label
              className="flex items-start gap-3 mt-8 text-[12px] max-w-[640px] cursor-pointer"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 70%, transparent)",
              }}
            >
              <input
                type="checkbox"
                checked={data.gdpr}
                onChange={(e) => set("gdpr", e.target.checked)}
                className="mt-0.5"
              />
              J&apos;accepte que {clientConfig.agencyName} me contacte dans les
              72 heures pour convenir d&apos;une visite d&apos;estimation
              gratuite et sans engagement.
            </label>
            {error && (
              <div
                className="mt-5 p-4 text-[13px] max-w-[640px]"
                style={{
                  background:
                    "color-mix(in oklch, var(--destructive) 10%, transparent)",
                  color: "var(--destructive)",
                  border: "1px solid var(--destructive)",
                }}
                role="alert"
              >
                {error}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div key="step-4" className="animate-fade-up">
            <div className="chapter-mark mb-6 animate-eyebrow-in">
              Demande envoyée
            </div>
            <h2
              className="h-display mb-6"
              style={{ fontSize: "clamp(36px, 5.5vw, 56px)", lineHeight: 1.1 }}
            >
              Merci, {data.firstName}.
              <br />
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                À très vite.
              </em>
            </h2>
            <p
              className="text-[15px] leading-[1.7] max-w-[560px] mb-10"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
              }}
            >
              Votre demande d&apos;estimation vient d&apos;être transmise au{" "}
              {clientConfig.agencyName}. Un associé prendra contact avec vous
              par e-mail dans les meilleurs délais pour convenir d&apos;une
              visite — la seule vraie façon de connaître la valeur d&apos;un
              bien.
            </p>

            <div
              className="p-8 mb-10"
              style={{
                border: "1px solid var(--bone-raw)",
                background: "var(--paper-raw)",
              }}
            >
              <div
                className="h-eyebrow mb-4"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                }}
              >
                Récapitulatif
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    Adresse
                  </dt>
                  <dd className="text-right">{data.address}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    Arrondissement
                  </dt>
                  <dd className="text-right">{data.district}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    Type
                  </dt>
                  <dd className="text-right">{data.type}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    Surface
                  </dt>
                  <dd className="text-right tabular">
                    {data.surface ? `${data.surface} m²` : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 sm:col-span-2">
                  <dt
                    style={{
                      color:
                        "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                    }}
                  >
                    Réponse à
                  </dt>
                  <dd className="text-right break-all">{data.email}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/" className="group btn-cobalt btn-shimmer">
                <span className="relative z-[1]">Retour à l&apos;accueil</span>
                <ArrowRight
                  className="h-3.5 w-3.5 group-arrow relative z-[1]"
                  strokeWidth={1.5}
                />
              </Link>
              <Link href="/biens" className="group link-under inline-flex items-center gap-2" style={{ color: "var(--ink-raw)" }}>
                Voir les biens du Cabinet
                <ArrowRight className="h-3.5 w-3.5 group-arrow" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between pt-10 rule">
        {step > 0 && step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="group link-under inline-flex items-center gap-2 transition-colors"
            style={{ color: "var(--ink-raw)" }}
          >
            <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />{" "}
            Précédent
          </button>
        ) : (
          <span />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canProceed || pending}
            className={
              "group disabled:opacity-60 transition-all duration-300 " +
              (step === 3 ? "btn-ink btn-shimmer" : "btn-ink btn-fill")
            }
          >
            <span className="relative z-[1] inline-flex items-center gap-2">
              {pending
                ? "Envoi…"
                : step === 3
                  ? "Envoyer ma demande"
                  : "Continuer"}
              <ArrowRight className="h-3.5 w-3.5 group-arrow" strokeWidth={1.5} />
            </span>
          </button>
        ) : (
          <Link
            href="/"
            className="group link-under inline-flex items-center gap-2"
            style={{ color: "var(--cobalt)" }}
          >
            Retour à l&apos;accueil
            <ArrowRight className="h-3.5 w-3.5 group-arrow" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </>
  );
}
