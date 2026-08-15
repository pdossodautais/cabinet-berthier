"use server";

import { createClient } from "@repo/shared/supabase/server";

const ALERTS_PER_EMAIL_MAX = 3;

export async function submitPropertyAlert(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { error: "Veuillez renseigner votre adresse e-mail." };
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Adresse e-mail invalide." };
  }

  const supabase = await createClient();

  // Rate limit: max 3 alerts per email
  const { count } = await supabase
    .from("property_alerts")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("is_active", true);

  if (count !== null && count >= ALERTS_PER_EMAIL_MAX) {
    return {
      error: `Vous avez déjà ${ALERTS_PER_EMAIL_MAX} alertes actives. Contactez-nous pour en modifier une.`,
    };
  }

  // Extract optional filters from search params
  const transactionType = (formData.get("transaction") as string) || null;
  const propertyType = (formData.get("type") as string) || null;
  const city = (formData.get("ville") as string) || null;
  const prixMaxRaw = formData.get("prix_max") as string;
  const surfaceMinRaw = formData.get("surface_min") as string;
  const roomsRaw = formData.get("pieces") as string;

  const prixMax = prixMaxRaw ? parseInt(prixMaxRaw, 10) : null;
  const surfaceMin = surfaceMinRaw ? parseInt(surfaceMinRaw, 10) : null;
  const rooms = roomsRaw ? parseInt(roomsRaw, 10) : null;

  const { error } = await supabase.from("property_alerts").insert({
    email,
    transaction_type: transactionType,
    property_type: propertyType,
    city,
    prix_max: Number.isFinite(prixMax) ? prixMax : null,
    surface_min: Number.isFinite(surfaceMin) ? surfaceMin : null,
    rooms: Number.isFinite(rooms) ? rooms : null,
  });

  if (error) {
    return { error: "Une erreur est survenue. Veuillez réessayer." };
  }

  return { success: true };
}
