import { createClient } from "@repo/shared/supabase/server";

type PropertyPayload = {
  id?: string;
  title: string;
  slug: string;
  price: number;
  city: string;
  surface: number;
  rooms: number;
  type: string;
  transaction_type: string;
  is_published: boolean;
  sold_at?: string | null;
};

/**
 * Envoie des emails d'alerte aux utilisateurs dont les critères correspondent
 * au bien publié ou modifié.
 *
 * Principe :
 *  - On regarde toutes les alertes actives
 *  - Pour chaque alerte qui matche, on vérifie si ce bien lui a déjà été
 *    notifié (via le tableau `notified_property_ids`)
 *  - Si non, on envoie l'email + on ajoute l'id au tableau
 *  - Non-bloquant : les erreurs ne font pas échouer la mise à jour DB
 *
 * Appelé à la création du bien et à chaque update, pas seulement au passage
 * de brouillon à publié (un bien édité qui entre dans les critères doit
 * notifier les nouveaux matchs).
 */
export async function notifyMatchingAlerts(property: PropertyPayload) {
  if (!property.is_published) return;
  if (property.sold_at) return; // bien vendu/loué : ne pas notifier
  if (!property.id) return; // sans id on ne peut pas tracker la dédup

  // Garde-fou contre la confusion "site URL = admin URL". Les liens dans
  // l'email (désinscription + /biens/*) doivent impérativement pointer
  // vers le site PUBLIC (apps/web), jamais vers le panel admin. Si
  // NEXT_PUBLIC_SITE_URL matche NEXT_PUBLIC_ADMIN_URL on abort — mieux
  // vaut ne pas envoyer que d'envoyer des 404.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (!siteUrl) return;
  if (adminUrl && siteUrl.replace(/\/+$/, "") === adminUrl.replace(/\/+$/, "")) {
    console.warn(
      "[notify-alerts] NEXT_PUBLIC_SITE_URL pointe vers l'admin — alertes non envoyées (liens invalides).",
    );
    return;
  }

  try {
    const supabase = await createClient();

    const { data: settings } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "agency_name")
      .single();
    const agencyName = settings?.value || "L'agence";

    // Récupérer toutes les alertes actives avec leur historique de notif
    const { data: alerts } = await supabase
      .from("property_alerts")
      .select(
        "id, email, transaction_type, property_type, city, prix_max, surface_min, rooms, notified_property_ids",
      )
      .eq("is_active", true);
    if (!alerts || alerts.length === 0) return;

    // Filtre : critères respectés ET jamais notifié pour ce bien
    const propertyId = property.id;
    const matching = alerts.filter((alert) => {
      if (alert.transaction_type && alert.transaction_type !== property.transaction_type) return false;
      if (alert.property_type && alert.property_type !== property.type) return false;
      if (alert.city && !property.city.toLowerCase().includes(alert.city.toLowerCase())) return false;
      if (alert.prix_max && property.price > alert.prix_max) return false;
      if (alert.surface_min && property.surface < alert.surface_min) return false;
      if (alert.rooms && property.rooms < alert.rooms) return false;
      // Dédup : si déjà notifié pour ce bien, on skip
      if ((alert.notified_property_ids ?? []).includes(propertyId)) return false;
      return true;
    });

    if (matching.length === 0) return;

    // Dédup par email : un utilisateur avec plusieurs alertes matchantes ne
    // reçoit qu'un seul email (mais on marque toutes ses alertes comme
    // notifiées pour ce bien).
    const byEmail = new Map<string, typeof matching>();
    for (const a of matching) {
      const list = byEmail.get(a.email) ?? [];
      list.push(a);
      byEmail.set(a.email, list);
    }

    const { sendPropertyAlert } = await import("@repo/shared/resend");
    const { buildUnsubUrls } = await import("@repo/shared/alert-tokens");

    // Envoi + marquage en parallèle, par batch de 10 pour ne pas saturer.
    // On calcule les URLs HMAC (désabonnement unique + global) à partir de
    // la première alerte de l'email — les alertes suivantes sont marquées
    // notifiées côté DB, mais côté destinataire un seul lien "cette alerte"
    // suffit puisqu'on dédup par email.
    const emails = [...byEmail.keys()];
    const results: Array<{ email: string; sent: boolean; alertIds: string[] }> =
      [];
    for (let i = 0; i < emails.length; i += 10) {
      const batch = emails.slice(i, i + 10);
      const settled = await Promise.allSettled(
        batch.map(async (email) => {
          const alertsForEmail = byEmail.get(email)!;
          const primary = alertsForEmail[0];
          const unsubscribe = buildUnsubUrls({
            siteUrl,
            alertId: primary.id as string,
            email,
          });
          const res = await sendPropertyAlert({
            to: email,
            agencyName,
            siteUrl,
            property,
            unsubscribe,
          });
          const sent = !("error" in res) || !res.error;
          return {
            email,
            sent,
            alertIds: alertsForEmail.map((a) => a.id as string),
          };
        }),
      );
      for (const s of settled) {
        if (s.status === "fulfilled") results.push(s.value);
      }
    }

    // Marquer toutes les alertes où l'email a été envoyé avec succès.
    // On update une ligne à la fois — Supabase PostgREST ne supporte pas
    // bien les array_append en bulk update. Parallélisé par lot de 20.
    const alertIdsToMark = results
      .filter((r) => r.sent)
      .flatMap((r) => r.alertIds);
    if (alertIdsToMark.length > 0) {
      const { data: rows } = await supabase
        .from("property_alerts")
        .select("id, notified_property_ids")
        .in("id", alertIdsToMark);
      if (rows && rows.length > 0) {
        await Promise.allSettled(
          rows.map((row) => {
            const merged = Array.from(
              new Set([...(row.notified_property_ids ?? []), propertyId]),
            );
            return supabase
              .from("property_alerts")
              .update({ notified_property_ids: merged })
              .eq("id", row.id);
          }),
        );
      }
    }
  } catch {
    // Silently fail — alert emails are a progressive enhancement
  }
}

/**
 * Digest admin : informe l'admin qu'un nouveau bien a été publié.
 * Activé via le setting `admin_notify_on_new_property` depuis /parametres.
 * Non-bloquant.
 */
export async function notifyAdminNewProperty(property: {
  title: string;
  slug: string;
  city: string;
  price: number;
  is_published: boolean;
  sold_at?: string | null;
}) {
  if (!property.is_published) return;
  if (property.sold_at) return; // bien vendu/loué : pas de digest
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || siteUrl;
  if (!adminUrl) return;

  try {
    const supabase = await createClient();
    const { data: all } = await supabase.from("settings").select("*");
    const getSetting = (k: string) =>
      all?.find((s: { key: string }) => s.key === k)?.value;

    if (getSetting("admin_notify_on_new_property") !== "true") return;

    const adminEmail =
      getSetting("admin_notification_email") || getSetting("agency_email");
    if (!adminEmail) return;

    const agencyName = getSetting("agency_name") || "L'agence";
    const price = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(property.price);

    const { sendAdminDigest } = await import("@repo/shared/resend");
    await sendAdminDigest({
      to: adminEmail,
      agencyName,
      event: "new_property",
      summary: `${property.title}\n${property.city} · ${price}`,
      detailUrl: siteUrl ? `${siteUrl}/biens/${property.slug}` : `${adminUrl}/biens`,
      detailLabel: "Voir la fiche",
    }).catch(() => {});
  } catch {
    // Silently fail
  }
}
