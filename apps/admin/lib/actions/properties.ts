"use server";

import { createClient } from "@repo/shared/supabase/server";
import { slugify } from "@repo/shared/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { revalidateWeb } from "../revalidate-web";
import { notifyMatchingAlerts, notifyAdminNewProperty } from "../notify-alerts";
import { parsePropertyForm, formatZodError } from "../validations";
import { safeError } from "../safe-error";

export async function createProperty(formData: FormData) {
  const parsed = parsePropertyForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const supabase = await createClient();

  const propertyData = {
    ...parsed.data,
    slug: slugify(parsed.data.title) + "-" + Date.now(),
  };

  const { data: inserted, error } = await supabase
    .from("properties")
    .insert(propertyData)
    .select("id")
    .single();

  if (error) {
    return { error: safeError(error, "properties") };
  }

  revalidatePath("/biens");
  await revalidateWeb("properties");

  // Notifier les alertes correspondantes + digest admin (non-bloquants)
  const payload = { ...propertyData, id: inserted?.id };
  notifyMatchingAlerts(payload).catch(() => {});
  notifyAdminNewProperty(payload).catch(() => {});

  // Plus de redirect — le client gère après upload des photos staged
  return { id: inserted!.id };
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient();

  // Vérifier si le bien était déjà publié avant la mise à jour
  const { data: previous } = await supabase
    .from("properties")
    .select("is_published, slug")
    .eq("id", id)
    .single();
  const wasPublished = previous?.is_published ?? false;

  const parsed = parsePropertyForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const updateData = parsed.data;

  const { error } = await supabase
    .from("properties")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: safeError(error, "properties") };
  }

  revalidatePath("/biens");
  revalidatePath(`/biens/${id}`);
  await revalidateWeb("properties");

  // Notifier sur chaque update d'un bien publié (pas seulement au passage
  // brouillon → publié). La dédup est gérée côté notify-alerts via
  // `notified_property_ids` → chaque alerte n'est notifiée qu'une fois
  // par bien. Cas couverts :
  //   1. brouillon → publié : comme avant, toutes les alertes matchantes
  //   2. bien publié modifié entrant dans de nouveaux critères : nouveaux
  //      matchs notifiés, anciens skippés
  //   3. bien publié inchangé côté critères : rien envoyé (tout déjà noté)
  //
  // `notifyAdminNewProperty` ne s'envoie qu'au passage brouillon → publié
  // pour éviter de spammer l'admin à chaque petite édition.
  if (updateData.is_published && previous?.slug) {
    const payload = { ...updateData, id, slug: previous.slug };
    notifyMatchingAlerts(payload).catch(() => {});
    if (!wasPublished) {
      notifyAdminNewProperty(payload).catch(() => {});
    }
  }

  redirect("/biens");
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();

  // Delete associated media first (cascade should handle this, but explicit)
  await supabase.from("property_media").delete().eq("property_id", id);

  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    return { error: safeError(error, "properties") };
  }

  revalidatePath("/biens");
  await revalidateWeb("properties");
  redirect("/biens");
}

export async function uploadPropertyImage(propertyId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }

  const ext = file.name.split(".").pop();
  const fileName = `${propertyId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("properties")
    .upload(fileName, file);

  if (uploadError) {
    return { error: safeError(uploadError, "properties.upload") };
  }

  const { data: urlData } = supabase.storage
    .from("properties")
    .getPublicUrl(fileName);

  // Get max position
  const { data: existing } = await supabase
    .from("property_media")
    .select("position")
    .eq("property_id", propertyId)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error: insertError } = await supabase.from("property_media").insert({
    property_id: propertyId,
    url: urlData.publicUrl,
    position: nextPosition,
  });

  if (insertError) {
    return { error: safeError(insertError, "properties.media") };
  }

  revalidatePath(`/biens/${propertyId}`);
  await revalidateWeb("properties");
  return { success: true, url: urlData.publicUrl };
}

export async function deletePropertyImage(mediaId: string, propertyId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("property_media").delete().eq("id", mediaId);

  if (error) {
    return { error: safeError(error, "properties") };
  }

  revalidatePath(`/biens/${propertyId}`);
  await revalidateWeb("properties");
  return { success: true };
}

export async function reorderPropertyImages(
  propertyId: string,
  orderedIds: string[]
) {
  const supabase = await createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("property_media")
      .update({ position: i })
      .eq("id", orderedIds[i]);
  }

  revalidatePath(`/biens/${propertyId}`);
  await revalidateWeb("properties");
  return { success: true };
}

/**
 * Marque un bien comme vendu/loué (selon transaction_type) ou le réactive.
 * Toggle simple : si sold_at est NULL → set à now(), sinon NULL.
 */
export async function toggleSoldStatus(id: string) {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("properties")
    .select("sold_at")
    .eq("id", id)
    .single();

  const newValue = current?.sold_at ? null : new Date().toISOString();

  const { error } = await supabase
    .from("properties")
    .update({ sold_at: newValue })
    .eq("id", id);

  if (error) return { error: safeError(error, "properties") };

  revalidatePath("/biens");
  revalidatePath(`/biens/${id}`);
  await revalidateWeb("properties");
  return { success: true, sold: newValue !== null };
}
