"use server";

import { createClient } from "@repo/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { safeError } from "../safe-error";

export async function updateEstimationStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("estimations")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: safeError(error, "estimations") };
  }

  revalidatePath("/estimations");
  revalidatePath(`/estimations/${id}`);
  return { success: true };
}

/**
 * Envoie une réponse par email au demandeur d'une estimation (via Resend) et
 * bascule automatiquement le statut sur « en_cours » si l'estimation était
 * encore sur « nouveau ». Réutilise le template ContactReply existant — il
 * est assez générique pour servir aussi pour une réponse d'estimation.
 */
export async function replyToEstimation(
  estimationId: string,
  message: string,
) {
  const supabase = await createClient();

  const { data: estimation } = await supabase
    .from("estimations")
    .select("email, first_name")
    .eq("id", estimationId)
    .single();

  if (!estimation) return { error: "Estimation introuvable." };

  const { data: settings } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "agency_name")
    .single();
  const agencyName = settings?.value || "Notre agence";

  try {
    const { sendContactReply } = await import("@repo/shared/resend");
    await sendContactReply({
      to: estimation.email,
      agencyName,
      contactFirstName: estimation.first_name,
      message,
    });
  } catch (e) {
    console.error("[reply estimation] Erreur Resend :", e);
    return { error: "Erreur lors de l'envoi de l'email." };
  }

  // Auto-update : si l'estimation est encore « nouveau », on passe à
  // « en_cours » puisqu'un premier échange vient d'avoir lieu.
  await supabase
    .from("estimations")
    .update({ status: "en_cours" })
    .eq("id", estimationId)
    .eq("status", "nouveau");

  revalidatePath("/estimations");
  revalidatePath(`/estimations/${estimationId}`);
  return { success: true };
}

export async function deleteEstimation(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("estimations").delete().eq("id", id);

  if (error) {
    return { error: safeError(error, "estimations") };
  }

  revalidatePath("/estimations");
  return { success: true };
}
