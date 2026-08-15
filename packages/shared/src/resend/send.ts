import { Resend } from "resend";
import ContactNotification from "@repo/emails/contact-notification";
import ContactConfirmation from "@repo/emails/contact-confirmation";
import PropertyAlert from "@repo/emails/property-alert";
import AgentInvitation from "@repo/emails/agent-invitation";
import AgentWelcome from "@repo/emails/agent-welcome";
import ContactReply from "@repo/emails/contact-reply";
import EstimationConfirmation from "@repo/emails/estimation-confirmation";
import AdminDigest from "@repo/emails/admin-digest";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactNotification({
  to,
  agencyName,
  contact,
}: {
  to: string;
  agencyName: string;
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    message: string;
  };
}) {
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: `Nouveau contact : ${contact.first_name} ${contact.last_name}`,
    react: ContactNotification({ agencyName, contact }),
  });
}

export async function sendContactConfirmation({
  to,
  agencyName,
  firstName,
}: {
  to: string;
  agencyName: string;
  firstName: string;
}) {
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: "Nous avons bien reçu votre message",
    react: ContactConfirmation({ agencyName, firstName }),
  });
}

export async function sendPropertyAlert({
  to,
  agencyName,
  siteUrl,
  property,
  unsubscribe,
}: {
  to: string;
  agencyName: string;
  siteUrl: string;
  property: {
    title: string;
    slug: string;
    price: number;
    city: string;
    surface: number;
    rooms: number;
    type: string;
    transaction_type: string;
  };
  /**
   * Liens HMAC préfabriqués (via `buildUnsubUrls` de `@repo/shared/alert-tokens`).
   * Si fournis, le footer du template affiche "Désactiver cette alerte" + "Toutes".
   * Optionnel pour rester compatible avec d'éventuels appels isolés.
   */
  unsubscribe?: { single: string; all: string };
}) {
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: `Nouveau bien : ${property.title} - ${property.city}`,
    react: PropertyAlert({ agencyName, siteUrl, property, unsubscribe }),
  });
}

export async function sendAgentInvitation({
  to,
  agencyName,
  firstName,
  inviteUrl,
}: {
  to: string;
  agencyName: string;
  firstName: string;
  inviteUrl: string;
}) {
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: `Invitation à rejoindre ${agencyName}`,
    react: AgentInvitation({ agencyName, firstName, inviteUrl }),
  });
}

export async function sendContactReply({
  to,
  agencyName,
  contactFirstName,
  message,
}: {
  to: string;
  agencyName: string;
  contactFirstName: string;
  message: string;
}) {
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: `Réponse de ${agencyName}`,
    react: ContactReply({ agencyName, contactFirstName, message }),
  });
}

export async function sendEstimationConfirmation({
  to,
  agencyName,
  firstName,
}: {
  to: string;
  agencyName: string;
  firstName: string;
}) {
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: "Demande d'estimation reçue",
    react: EstimationConfirmation({ agencyName, firstName }),
  });
}

export async function sendAgentWelcome({
  to,
  agencyName,
  firstName,
  adminUrl,
}: {
  to: string;
  agencyName: string;
  firstName: string;
  adminUrl: string;
}) {
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: `Bienvenue chez ${agencyName}`,
    react: AgentWelcome({ agencyName, firstName, adminUrl }),
  });
}

export async function sendAdminDigest({
  to,
  agencyName,
  event,
  summary,
  detailUrl,
  detailLabel,
}: {
  to: string;
  agencyName: string;
  event: "new_contact" | "new_estimation" | "new_property";
  summary: string;
  detailUrl: string;
  detailLabel: string;
}) {
  const subjects: Record<typeof event, string> = {
    new_contact: "[Admin] Nouveau message reçu",
    new_estimation: "[Admin] Nouvelle demande d'estimation",
    new_property: "[Admin] Nouveau bien publié",
  };
  return resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to,
    subject: subjects[event],
    react: AdminDigest({ agencyName, event, summary, detailUrl, detailLabel }),
  });
}
