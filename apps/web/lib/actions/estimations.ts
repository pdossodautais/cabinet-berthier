"use server";

import { createClient, createServiceClient } from "@repo/shared/supabase/server";
import { headers } from "next/headers";

// Rate limiting in-memory — resets au redémarrage du serveur.
// Suffisant pour un template, mais en production à fort trafic,
// envisager Redis ou Upstash pour un rate limiting persistant.
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

// Caps de taille — protection contre stockage abusif + affichage back-office
const NAME_MAX = 200;
const EMAIL_MAX = 320;
const PHONE_MAX = 40;
const ADDRESS_MAX = 300;
const CITY_MAX = 120;
const POSTAL_CODE_MAX = 20;
const PROPERTY_TYPE_MAX = 40;
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

function sanitizeString(
  value: FormDataEntryValue | null,
  max: number,
): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (!cleaned) return null;
  return cleaned.slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitEstimationForm(formData: FormData) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return { error: "Trop de demandes envoyées. Veuillez réessayer plus tard." };
  }

  // Honeypot
  const honeypot = formData.get("website");
  if (honeypot) {
    return { error: "Une erreur est survenue." };
  }

  const tsValue = formData.get("_ts");
  if (tsValue && Date.now() - Number(tsValue) < 2000) {
    return { error: "Une erreur est survenue." };
  }

  const supabase = await createClient();

  // Sanitize + trim + cap les entrées user-controlled.
  const first_name = sanitizeString(formData.get("first_name"), NAME_MAX);
  const last_name = sanitizeString(formData.get("last_name"), NAME_MAX);
  const email = sanitizeString(formData.get("email"), EMAIL_MAX);
  const phone = sanitizeString(formData.get("phone"), PHONE_MAX);
  const address = sanitizeString(formData.get("address"), ADDRESS_MAX);
  const city = sanitizeString(formData.get("city"), CITY_MAX);
  const postal_code = sanitizeString(formData.get("postal_code"), POSTAL_CODE_MAX);
  const property_type = sanitizeString(
    formData.get("property_type"),
    PROPERTY_TYPE_MAX,
  );
  const message = sanitizeString(formData.get("message"), MESSAGE_MAX);

  const surfaceRaw = formData.get("surface");
  const roomsRaw = formData.get("rooms");
  const surface =
    typeof surfaceRaw === "string" && surfaceRaw ? Number(surfaceRaw) : null;
  const rooms = typeof roomsRaw === "string" && roomsRaw ? Number(roomsRaw) : null;

  if (!first_name || !last_name || !email || !address || !city) {
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
    address,
    city,
    postal_code: postal_code || "",
    property_type: property_type || "",
    surface: Number.isFinite(surface) ? surface : null,
    rooms: Number.isFinite(rooms) ? rooms : null,
    message,
    status: "nouveau" as const,
  };

  const { error } = await supabase.from("estimations").insert(data);

  if (error) {
    console.error("[estimations]", error.message);
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  // Send confirmation + notification emails
  try {
    const { sendEstimationConfirmation, sendContactNotification } =
      await import("@repo/shared/resend");
    const { data: settings } = await supabase.from("settings").select("*");
    const agencyName =
      settings?.find((s: { key: string }) => s.key === "agency_name")?.value ||
      "L'agence";

    // Send confirmation to the visitor
    await sendEstimationConfirmation({
      to: data.email,
      agencyName,
      firstName: data.first_name,
    });

    // Find agents who opted in for estimation notifications.
    // IMPORTANT : la table `notification_preferences` est protégée par RLS
    // `TO authenticated` — un visiteur anonyme qui soumet le formulaire ne
    // pourrait pas la lire et recevrait `[]` sans erreur. On lit donc les
    // prefs via le service_role pour ce cas précis (l'INSERT de l'estimation
    // reste sur le client public puisque la policy publique le permet).
    const adminClient = await createServiceClient();
    const { data: prefs } = await adminClient
      .from("notification_preferences")
      .select("agent_id, agents!inner(email)")
      .eq("event_type", "estimation")
      .eq("enabled", true);

    const recipients = (prefs || [])
      .map((p) => (p.agents as unknown as { email: string })?.email)
      .filter(Boolean);

    if (recipients.length === 0) {
      const fallback =
        settings?.find((s: { key: string }) => s.key === "agency_email")
          ?.value;
      if (fallback) recipients.push(fallback);
    }

    // Notify opted-in agents (reuse contact notification template)
    await Promise.allSettled(
      recipients.map((to) =>
        sendContactNotification({
          to,
          agencyName,
          contact: {
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            message: `Demande d'estimation — ${data.address}, ${data.city} ${data.postal_code}${data.surface ? ` — ${data.surface} m²` : ""}${data.rooms ? ` — ${data.rooms} pièces` : ""}${data.message ? `\n\n${data.message}` : ""}`,
          },
        }),
      ),
    );

    // Digest admin : activé via /parametres
    const adminNotify = settings?.find((s: { key: string }) => s.key === "admin_notify_on_estimation")?.value === "true";
    if (adminNotify) {
      const adminEmail =
        settings?.find((s: { key: string }) => s.key === "admin_notification_email")?.value ||
        settings?.find((s: { key: string }) => s.key === "agency_email")?.value;
      const siteUrl = process.env.NEXT_PUBLIC_ADMIN_URL || process.env.NEXT_PUBLIC_SITE_URL;
      if (adminEmail && siteUrl) {
        const { sendAdminDigest } = await import("@repo/shared/resend");
        await sendAdminDigest({
          to: adminEmail,
          agencyName,
          event: "new_estimation",
          summary: `Demande d'estimation\n\nDe : ${data.first_name} ${data.last_name} <${data.email}>${data.phone ? `\nTél : ${data.phone}` : ""}\nBien : ${data.address}, ${data.postal_code} ${data.city}${data.surface ? `\nSurface : ${data.surface} m²` : ""}${data.rooms ? `\nPièces : ${data.rooms}` : ""}${data.message ? `\n\n${data.message}` : ""}`,
          detailUrl: `${siteUrl}/estimations`,
          detailLabel: "Voir dans l'admin",
        }).catch(() => {});
      }
    }
  } catch (err) {
    // Email sending failed — don't block the form submission, mais log
    // dans Vercel Functions pour debug (lien Supabase down, Resend
    // quota épuisé, etc.).
    console.error("[estimations/notif] unexpected error:", err);
  }

  return { success: true };
}
