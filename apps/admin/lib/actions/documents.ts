"use server";

import { createClient } from "@repo/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateWeb } from "../revalidate-web";
import { parseDocumentForm, formatZodError } from "../validations";
import { safeError } from "../safe-error";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) return { error: "Aucun fichier." };

  const parsed = parseDocumentForm(formData, file.name);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const { property_id: propertyId, type: docType, name: docName } = parsed.data;

  const ext = file.name.split(".").pop();
  const fileName = `${propertyId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(fileName, file);
  if (uploadError) return { error: safeError(uploadError, "documents.upload") };

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(fileName);

  // Get next position
  const { count } = await supabase
    .from("property_documents")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const { error } = await supabase.from("property_documents").insert({
    property_id: propertyId,
    name: docName,
    url: urlData.publicUrl,
    type: docType,
    position: count || 0,
  });

  if (error) return { error: safeError(error, "documents") };

  revalidatePath(`/biens/${propertyId}`);
  await revalidateWeb("properties");
  return { success: true, url: urlData.publicUrl };
}

export async function deleteDocument(id: string, propertyId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("property_documents")
    .delete()
    .eq("id", id);
  if (error) return { error: safeError(error, "documents") };
  revalidatePath(`/biens/${propertyId}`);
  await revalidateWeb("properties");
  return { success: true };
}
