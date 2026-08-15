"use server";

import { createClient, createServiceClient } from "@repo/shared/supabase/server";
import { headers } from "next/headers";

// Rate limiting in-memory — resets au redémarrage du serveur.
// Suffisant pour un template, mais en production à fort trafic,
// envisager Redis ou Upstash pour un rate limiting persistant.
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Caps de taille — protection contre stockage abusif + affichage back-office
const NAME_MAX = 200;
const EMAIL_MAX = 320; // RFC 5321
const PHONE_MAX = 40;
const MESSAGE_MAX = 2000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Nettoie une chaîne : trim + strip des control chars (sauf \n, \r, \t)
// et tronque à `max`. Retourne `null` si vide après trim.
function sanitizeString(value: FormDataEntryValue | null, max: number): string | null {
  if (typeof value !== "string") return null;
  // \u0000-\u0008, \u000B, \u000C, \u000E-\u001F, \u007F
  const cleaned = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (!cleaned) return null;
  return cleaned.slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitContactForm(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return { error: "Trop de messages envoyés. Veuillez réessayer plus tard." };
  }

  // Honeypot anti-spam checks — messages différenciés pour aider le
  // debugging (les utilisateurs humains ne voient PAS ces cas sauf
  // autofill agressif d'un password manager).
  const honeypot = formData.get("website");
  if (honeypot) {
    console.warn("[contacts] honeypot filled:", honeypot);
    return { error: "Le formulaire semble être rempli par un robot. Si vous êtes un utilisateur, désactivez l'autofill de votre navigateur." };
  }

  const tsValue = formData.get("_ts");
  if (tsValue && Date.now() - Number(tsValue) < 2000) {
    console.warn("[contacts] timestamp too recent:", Date.now() - Number(tsValue), "ms");
    return { error: "Envoi trop rapide. Attendez une seconde avant de soumettre." };
  }

  const supabase = await createClient();

  // Sanitize toutes les entrées user-controlled AVANT l'insertion en DB.
  // React échappe côté JSX mais l'admin back-office et les emails doivent
  // aussi être protégés de strings malformées / trop longues.
  const first_name = sanitizeString(formData.get("first_name"), NAME_MAX);
  const last_name = sanitizeString(formData.get("last_name"), NAME_MAX);
  const email = sanitizeString(formData.get("email"), EMAIL_MAX);
  const phone = sanitizeString(formData.get("phone"), PHONE_MAX);
  const message = sanitizeString(formData.get("message"), MESSAGE_MAX);
  const property_id = sanitizeString(formData.get("property_id"), 64);

  if (!first_name || !last_name || !email || !message) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  if (!isValidEmail(email)) {
    return { error: "Adresse e-mail invalide." };
  }

  const data = {
    first_name,
    last_name,
    email,
    phone,
    message,
    property_id,
    status: "nouveau" as const,
  };

  const { error } = await supabase.from("contacts").insert(data);

  if (error) {
    console.error("[contacts]", error.message);
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  // Send notification emails to opted-in agents + confirmation to visitor
  try {
    const { sendContactNotification, sendContactConfirmation } = await import(
      "@repo/shared/resend"
    );
    const { data: settings } = await supabase.from("settings").select("*");
    const agencyName =
      settings?.find((s) => s.key === "agency_name")?.value || "L'agence";

    // Find agents who opted in for contact notifications.
    // IMPORTANT : la table `notification_preferences` est protégée par RLS
    // `TO authenticated` — un visiteur anonyme qui soumet le formulaire ne
    // pourrait pas la lire et recevrait `[]` sans erreur. On lit donc les
    // prefs via le service_role pour ce cas précis (l'INSERT du contact
    // reste sur le client public puisque la policy publique le permet).
    const adminClient = await createServiceClient();
    const { data: prefs } = await adminClient
      .from("notification_preferences")
      .select("agent_id, agents!inner(email)")
      .eq("event_type", "contact")
      .eq("enabled", true);

    const recipients = (prefs || [])
      .map((p) => (p.agents as unknown as { email: string })?.email)
      .filter(Boolean);

    // Fallback to agency_email if no agent has opted in
    if (recipients.length === 0) {
      const fallback =
        settings?.find((s) => s.key === "agency_email")?.value;
      if (fallback) recipients.push(fallback);
    }

    // Send notification to each opted-in agent
    await Promise.allSettled(
      recipients.map((to) =>
        sendContactNotification({ to, agencyName, contact: data }),
      ),
    );

    // Send confirmation to the visitor
    await sendContactConfirmation({
      to: data.email,
      agencyName,
      firstName: data.first_name,
    });

    // Digest admin : envoyé seulement si l'admin a activé la notif dans /parametres
    const adminNotify = settings?.find((s) => s.key === "admin_notify_on_contact")?.value === "true";
    if (adminNotify) {
      const adminEmail =
        settings?.find((s) => s.key === "admin_notification_email")?.value ||
        settings?.find((s) => s.key === "agency_email")?.value;
      const siteUrl = process.env.NEXT_PUBLIC_ADMIN_URL || process.env.NEXT_PUBLIC_SITE_URL;
      if (adminEmail && siteUrl) {
        const { sendAdminDigest } = await import("@repo/shared/resend");
        await sendAdminDigest({
          to: adminEmail,
          agencyName,
          event: "new_contact",
          summary: `De : ${data.first_name} ${data.last_name} <${data.email}>${data.phone ? `\nTél : ${data.phone}` : ""}\n\n${data.message}`,
          detailUrl: `${siteUrl}/contacts`,
          detailLabel: "Voir dans l'admin",
        }).catch(() => {});
      }
    }
  } catch (err) {
    // Email sending failed -- don't block the form submission, mais log
    // dans Vercel Functions pour debug (lien Supabase down, Resend
    // quota épuisé, etc.).
    console.error("[contacts/notif] unexpected error:", err);
  }

  return { success: true };
}
