"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { Button } from "@repo/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@repo/ui/item";
import { Switch } from "@repo/ui/switch";
import {
  Mail,
  Calculator,
  Home,
  MessageCircle,
  Reply,
  Bell,
  UserPlus,
  Sparkles,
} from "lucide-react";

import {
  updateSettings,
  sendTestAdminEmail,
  sendTestEmail,
  type TestEmailTemplate,
} from "@/lib/actions/settings";

/* ────────────────────────────────────────────────────────────────
 * Wrappers partagés
 * ──────────────────────────────────────────────────────────────── */

/** Card blanche avec filet + footer action bar bg-muted.
 *  Le pattern de toutes les sections qui ont un bouton Enregistrer. */
function FormCard({
  action,
  children,
  submitLabel = "Enregistrer",
  boolKeys,
}: {
  action: (formData: FormData) => Promise<{ success: boolean }>;
  children: React.ReactNode;
  submitLabel?: string;
  /** Liste des checkbox-keys appartenant à ce form (pour partial update). */
  boolKeys?: string[];
}) {
  const [saving, setSaving] = useState(false);

  async function handle(formData: FormData) {
    setSaving(true);
    try {
      await action(formData);
      toast.success("Modifications enregistrées.");
    } catch {
      toast.error("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      action={handle}
      className="rounded-xl border bg-card overflow-hidden"
    >
      {boolKeys && boolKeys.length > 0 && (
        <input type="hidden" name="_bool_keys" value={boolKeys.join(",")} />
      )}
      <div className="p-6">{children}</div>
      <div className="flex items-center justify-end gap-3 border-t bg-muted/20 px-6 py-3">
        <Button type="submit" size="sm" disabled={saving}>
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          {saving ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────
 * 1. Coordonnées — adresse, téléphone, email, horaires, Maps URL
 * ──────────────────────────────────────────────────────────────── */

export function AgencyCoordinatesForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  // Snapshot initial — base-ui FieldControl interdit de changer un
  // defaultValue après mount. revalidatePath après save renvoie de
  // nouvelles props, ce qui ferait muter defaultValue sans ce garde-fou.
  const [s] = useState(settings);
  return (
    <FormCard action={updateSettings}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="agency_address">Adresse</FieldLabel>
          <Input
            id="agency_address"
            name="agency_address"
            defaultValue={s.agency_address || ""}
            placeholder="102 avenue des Champs-Élysées, 75008 Paris"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="agency_phone">Téléphone</FieldLabel>
            <Input
              id="agency_phone"
              name="agency_phone"
              defaultValue={s.agency_phone || ""}
              placeholder="01 23 45 67 89"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="agency_email">Email</FieldLabel>
            <Input
              id="agency_email"
              name="agency_email"
              type="email"
              defaultValue={s.agency_email || ""}
              placeholder="contact@agence.fr"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="agency_hours">Horaires</FieldLabel>
          <Input
            id="agency_hours"
            name="agency_hours"
            defaultValue={s.agency_hours || ""}
            placeholder="Lun-Ven : 9h-18h · Sam : 10h-13h"
          />
          <FieldDescription>
            Affichés dans le footer du site vitrine et sur la page Contact.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="agency_maps_url">Lien Google Maps</FieldLabel>
          <Input
            id="agency_maps_url"
            name="agency_maps_url"
            type="url"
            defaultValue={s.agency_maps_url || ""}
            placeholder="https://maps.google.com/?q=…"
          />
          <FieldDescription>
            Ouvert au clic sur l&apos;adresse. Si vide, une recherche Maps est
            générée automatiquement.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </FormCard>
  );
}

/* ────────────────────────────────────────────────────────────────
 * 2. Avis clients — lien vers Google Reviews / autre plateforme
 * ──────────────────────────────────────────────────────────────── */

export function ReviewsForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [s] = useState(settings);
  return (
    <FormCard action={updateSettings}>
      <Field>
        <FieldLabel htmlFor="google_reviews_url">
          Lien « Laisser un avis »
        </FieldLabel>
        <Input
          id="google_reviews_url"
          name="google_reviews_url"
          type="url"
          defaultValue={s.google_reviews_url || ""}
          placeholder="https://search.google.com/local/writereview?placeid=…"
        />
        <FieldDescription>
          URL ouverte au clic sur le bouton « Laisser un avis » de la page
          Témoignages.
        </FieldDescription>
      </Field>
    </FormCard>
  );
}

/* ────────────────────────────────────────────────────────────────
 * 3. Réseaux sociaux — 4 liens
 * ──────────────────────────────────────────────────────────────── */

const SOCIAL_PLATFORMS = [
  {
    key: "social_facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/…",
  },
  {
    key: "social_instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/…",
  },
  {
    key: "social_linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/…",
  },
  {
    key: "social_twitter",
    label: "X (ex-Twitter)",
    placeholder: "https://x.com/…",
  },
] as const;

export function SocialLinksForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [s] = useState(settings);
  return (
    <FormCard action={updateSettings}>
      <FieldGroup>
        {SOCIAL_PLATFORMS.map((p) => (
          <Field key={p.key}>
            <FieldLabel htmlFor={p.key}>{p.label}</FieldLabel>
            <Input
              id={p.key}
              name={p.key}
              type="url"
              defaultValue={s[p.key] || ""}
              placeholder={p.placeholder}
            />
          </Field>
        ))}
      </FieldGroup>
    </FormCard>
  );
}

/* ────────────────────────────────────────────────────────────────
 * 4. Notifications admin — email + 3 Items avec Switch + bouton test
 * ──────────────────────────────────────────────────────────────── */

type AdminNotifEvent = "new_contact" | "new_estimation" | "new_property";

const ADMIN_EVENTS: Array<{
  key: string;
  event: AdminNotifEvent;
  icon: typeof Mail;
  label: string;
  description: string;
}> = [
  {
    key: "admin_notify_on_contact",
    event: "new_contact",
    icon: Mail,
    label: "Nouveau message de contact",
    description:
      "Reçoit tous les messages reçus via le formulaire, en complément des agents opt-in.",
  },
  {
    key: "admin_notify_on_estimation",
    event: "new_estimation",
    icon: Calculator,
    label: "Nouvelle demande d'estimation",
    description:
      "Reçoit les détails complets (adresse, surface, pièces, contact).",
  },
  {
    key: "admin_notify_on_new_property",
    event: "new_property",
    icon: Home,
    label: "Nouveau bien publié",
    description: "En complément des alertes envoyées aux clients matchants.",
  },
];

export function AdminNotificationsForm({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [s] = useState(settings);
  const [testEmail, setTestEmail] = useState(
    s.admin_notification_email || s.agency_email || "",
  );
  const [testing, setTesting] = useState<AdminNotifEvent | null>(null);

  async function handleTest(event: AdminNotifEvent) {
    if (!testEmail) {
      toast.error("Renseignez une adresse email d'abord.");
      return;
    }
    setTesting(event);
    const res = await sendTestAdminEmail(testEmail, event);
    setTesting(null);
    if (res.success) {
      toast.success(`Email de test envoyé à ${testEmail}.`);
    } else {
      toast.error(res.error || "Échec de l'envoi.");
    }
  }

  return (
    <FormCard
      action={updateSettings}
      boolKeys={ADMIN_EVENTS.map((e) => e.key)}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="admin_notification_email">
            Email de réception
          </FieldLabel>
          <Input
            id="admin_notification_email"
            name="admin_notification_email"
            type="email"
            defaultValue={s.admin_notification_email || ""}
            placeholder={s.agency_email || "admin@exemple.com"}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <FieldDescription>
            Si vide, les emails sont envoyés à l&apos;adresse de l&apos;agence.
          </FieldDescription>
        </Field>

        <div className="space-y-3">
          {ADMIN_EVENTS.map((e) => (
            <Item key={e.key} variant="outline" className="gap-4">
              <ItemMedia variant="icon">
                <e.icon className="size-4" strokeWidth={1.75} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{e.label}</ItemTitle>
                <ItemDescription>{e.description}</ItemDescription>
              </ItemContent>
              <ItemActions className="flex-row items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={testing === e.event}
                  onClick={() => handleTest(e.event)}
                  aria-label={`Envoyer un email de test pour ${e.label}`}
                >
                  {testing === e.event ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" strokeWidth={1.75} />
                  )}
                  <span className="hidden sm:inline">
                    {testing === e.event ? "Envoi…" : "Tester"}
                  </span>
                </Button>
                <Switch
                  name={e.key}
                  defaultChecked={s[e.key] === "true"}
                  aria-label={`Activer « ${e.label} »`}
                />
              </ItemActions>
            </Item>
          ))}
        </div>
      </FieldGroup>
    </FormCard>
  );
}

/* ────────────────────────────────────────────────────────────────
 * 5. Tester tous les emails — catalogue complet des templates
 * ──────────────────────────────────────────────────────────────── */

type EmailPreviewEntry = {
  template: TestEmailTemplate;
  label: string;
  description: string;
  icon: typeof Mail;
};

const CLIENT_EMAILS: EmailPreviewEntry[] = [
  {
    template: "contact_confirmation",
    label: "Confirmation de message",
    description:
      "Envoyé au client dès qu'il envoie un message via le formulaire de contact.",
    icon: MessageCircle,
  },
  {
    template: "estimation_confirmation",
    label: "Confirmation d'estimation",
    description:
      "Envoyé au client dès qu'il soumet une demande d'estimation.",
    icon: Calculator,
  },
  {
    template: "contact_reply",
    label: "Réponse à un message",
    description:
      "Envoyé au client quand un membre de l'équipe lui répond depuis l'admin.",
    icon: Reply,
  },
  {
    template: "property_alert",
    label: "Alerte bien",
    description:
      "Envoyé à un abonné aux alertes quand un nouveau bien correspond à ses critères.",
    icon: Bell,
  },
];

const AGENT_EMAILS: EmailPreviewEntry[] = [
  {
    template: "agent_invitation",
    label: "Invitation à rejoindre l'équipe",
    description:
      "Envoyé à un nouveau collègue quand vous l'ajoutez depuis la section Équipe.",
    icon: UserPlus,
  },
  {
    template: "agent_welcome",
    label: "Bienvenue",
    description:
      "Envoyé au collègue après qu'il a activé son compte avec son mot de passe.",
    icon: Sparkles,
  },
];

/**
 * Carte autonome (sans bouton Enregistrer) qui permet d'envoyer un
 * aperçu de chaque template d'email à n'importe quelle adresse. Utile
 * pour valider la charte, les placeholders et la config Resend sans
 * devoir déclencher un vrai événement (créer un contact, inviter un
 * agent, publier un bien qui matche une alerte, etc.).
 */
export function TestEmailsCard({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [s] = useState(settings);
  const [to, setTo] = useState(
    s.admin_notification_email || s.agency_email || "",
  );
  const [sending, setSending] = useState<TestEmailTemplate | null>(null);

  async function handleSend(template: TestEmailTemplate, label: string) {
    if (!to) {
      toast.error("Renseignez une adresse email d'abord.");
      return;
    }
    setSending(template);
    const res = await sendTestEmail(to, template);
    setSending(null);
    if (res.success) {
      toast.success(`Aperçu « ${label} » envoyé à ${to}.`);
    } else {
      toast.error(res.error || "Échec de l'envoi.");
    }
  }

  function renderGroup(title: string, entries: EmailPreviewEntry[]) {
    return (
      <div className="space-y-3">
        <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h4>
        <div className="space-y-3">
          {entries.map((e) => (
            <Item key={e.template} variant="outline" className="gap-4">
              <ItemMedia variant="icon">
                <e.icon className="size-4" strokeWidth={1.75} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{e.label}</ItemTitle>
                <ItemDescription>{e.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={sending === e.template}
                  onClick={() => handleSend(e.template, e.label)}
                  aria-label={`Envoyer un aperçu de « ${e.label} »`}
                >
                  {sending === e.template ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" strokeWidth={1.75} />
                  )}
                  <span className="hidden sm:inline">
                    {sending === e.template ? "Envoi…" : "Tester"}
                  </span>
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="test_emails_to">Adresse d&apos;envoi</FieldLabel>
            <Input
              id="test_emails_to"
              type="email"
              value={to}
              onChange={(ev) => setTo(ev.target.value)}
              placeholder="votre@email.com"
            />
            <FieldDescription>
              Tous les aperçus ci-dessous sont envoyés à cette adresse. Les
              textes sont signalés comme exemples — aucun impact sur vos
              vraies données.
            </FieldDescription>
          </Field>

          {renderGroup("Emails aux clients & abonnés", CLIENT_EMAILS)}
          {renderGroup("Emails aux agents", AGENT_EMAILS)}
        </FieldGroup>
      </div>
    </div>
  );
}
