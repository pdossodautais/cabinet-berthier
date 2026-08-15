"use server";

import { createClient } from "@repo/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateWeb } from "../revalidate-web";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();

  const stringKeys = [
    "agency_address",
    "agency_phone",
    "agency_email",
    "agency_hours",
    "agency_maps_url",
    "google_reviews_url",
    "social_facebook",
    "social_instagram",
    "social_linkedin",
    "social_twitter",
    "admin_notification_email",
  ];

  const boolKeys = [
    "admin_notify_on_contact",
    "admin_notify_on_estimation",
    "admin_notify_on_new_property",
  ];

  // Updates partiels : on touche UNIQUEMENT les keys dont le champ est
  // présent dans la FormData soumise. Pour les text inputs, `.has()` suffit
  // (même vides, ils émettent une entrée). Pour les checkboxes (absents
  // quand décochés), le form doit ajouter un hidden `_bool_keys` listant
  // les clés booléennes de son scope, séparées par virgule.
  const boolKeysInScope = new Set(
    ((formData.get("_bool_keys") as string) || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
  );

  for (const key of stringKeys) {
    if (!formData.has(key)) continue;
    const value = (formData.get(key) as string) || "";
    await supabase
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });
  }

  for (const key of boolKeys) {
    if (!boolKeysInScope.has(key)) continue;
    const value = formData.get(key) === "on" ? "true" : "false";
    await supabase
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });
  }

  revalidatePath("/parametres");
  revalidatePath("/");
  await revalidateWeb("settings");
  return { success: true };
}

/**
 * Templates d'email testables depuis /parametres. Couvre l'intégralité
 * du catalogue envoyé automatiquement par la plateforme — 3 digests
 * admin + 6 emails clients/équipe — pour valider Resend + la charte
 * éditoriale sans devoir déclencher un vrai événement.
 */
export type TestEmailTemplate =
  | "admin_new_contact"
  | "admin_new_estimation"
  | "admin_new_property"
  | "contact_confirmation"
  | "contact_reply"
  | "estimation_confirmation"
  | "agent_invitation"
  | "agent_welcome"
  | "property_alert";

/**
 * Envoie un email de test correspondant à un template existant. Tous les
 * contenus sont en « mode exemple » pour que le destinataire comprenne
 * immédiatement qu'il s'agit d'un aperçu, pas d'un vrai événement.
 */
export async function sendTestEmail(
  to: string,
  template: TestEmailTemplate,
): Promise<{ success: boolean; error?: string }> {
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { success: false, error: "Email invalide." };
  }

  try {
    const supabase = await createClient();
    const { data: all } = await supabase.from("settings").select("*");
    const agencyName =
      all?.find((s) => s.key === "agency_name")?.value || "L'agence";

    // URL du site public : toujours utilisée pour les liens dans les
    // emails destinés aux clients/abonnés (bien, désinscription, etc.).
    // Garde le garde-fou : si elle matche l'URL admin on sait que c'est
    // mal configuré et on renvoie une erreur plutôt qu'un faux test.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
    if (
      siteUrl.replace(/\/+$/, "") === adminUrl.replace(/\/+$/, "") &&
      [
        "property_alert",
        "contact_confirmation",
        "contact_reply",
        "estimation_confirmation",
      ].includes(template)
    ) {
      return {
        success: false,
        error:
          "NEXT_PUBLIC_SITE_URL pointe vers l'admin — les liens de l'email seraient cassés. Corrigez la config.",
      };
    }

    const resend = await import("@repo/shared/resend");

    let result: { error?: { message: string } | null };

    switch (template) {
      case "admin_new_contact":
      case "admin_new_estimation":
      case "admin_new_property": {
        const event = template.replace("admin_", "") as
          | "new_contact"
          | "new_estimation"
          | "new_property";
        const samples: Record<
          typeof event,
          { summary: string; detailLabel: string }
        > = {
          new_contact: {
            summary:
              "De : Exemple Prénom Nom <exemple@email.com>\nTél : 06 00 00 00 00\n\nBonjour, je suis intéressé(e) par vos services. Ceci est un email de test.",
            detailLabel: "Voir dans l'admin",
          },
          new_estimation: {
            summary:
              "Demande d'estimation\n\nDe : Exemple Prénom Nom <exemple@email.com>\nTél : 06 00 00 00 00\nBien : 1 rue Exemple, 75000 Paris\nSurface : 65 m²\nPièces : 3",
            detailLabel: "Voir dans l'admin",
          },
          new_property: {
            summary: "Bien exemple — Ville · 250 000 €",
            detailLabel: "Voir la fiche",
          },
        };
        result = await resend.sendAdminDigest({
          to,
          agencyName,
          event,
          summary: samples[event].summary,
          detailUrl: `${adminUrl}/`,
          detailLabel: samples[event].detailLabel,
        });
        break;
      }

      case "contact_confirmation":
        result = await resend.sendContactConfirmation({
          to,
          agencyName,
          firstName: "Exemple",
        });
        break;

      case "contact_reply":
        result = await resend.sendContactReply({
          to,
          agencyName,
          contactFirstName: "Exemple",
          message:
            "Bonjour, merci pour votre message. Ceci est un email de test simulant une réponse à un contact. En condition réelle, le corps du message est saisi par un membre de l'équipe.",
        });
        break;

      case "estimation_confirmation":
        result = await resend.sendEstimationConfirmation({
          to,
          agencyName,
          firstName: "Exemple",
        });
        break;

      case "agent_invitation":
        result = await resend.sendAgentInvitation({
          to,
          agencyName,
          firstName: "Exemple",
          inviteUrl: `${adminUrl}/auth/invitation?token=test-preview-token`,
        });
        break;

      case "agent_welcome":
        result = await resend.sendAgentWelcome({
          to,
          agencyName,
          firstName: "Exemple",
          adminUrl,
        });
        break;

      case "property_alert": {
        // URLs HMAC signées pour l'aperçu : le clic ne désactivera rien
        // (l'alertId est fictif), mais visuellement les liens sont là.
        const { buildUnsubUrls } = await import("@repo/shared/alert-tokens");
        const unsubscribe = buildUnsubUrls({
          siteUrl,
          alertId: "00000000-0000-4000-8000-000000000000",
          email: to,
        });
        result = await resend.sendPropertyAlert({
          to,
          agencyName,
          siteUrl,
          property: {
            title: "Appartement traversant — exemple",
            slug: "exemple-appartement-test",
            price: 495000,
            city: "Paris 8e",
            surface: 68,
            rooms: 3,
            type: "appartement",
            transaction_type: "vente",
          },
          unsubscribe,
        });
        break;
      }

      default:
        return { success: false, error: "Template inconnu." };
    }

    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

/** @deprecated — utiliser `sendTestEmail`. Conservé le temps que la UI
 *  existante migre vers le nouveau nom. */
export async function sendTestAdminEmail(
  to: string,
  event: "new_contact" | "new_estimation" | "new_property",
): Promise<{ success: boolean; error?: string }> {
  return sendTestEmail(to, `admin_${event}` as TestEmailTemplate);
}
