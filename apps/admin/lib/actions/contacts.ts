"use server";

import { createClient } from "@repo/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { safeError } from "../safe-error";

export async function updateContactStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("contacts")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: safeError(error, "contacts") };
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  return { success: true };
}

export async function replyToContact(contactId: string, message: string) {
  const supabase = await createClient();

  // Get contact info
  const { data: contact } = await supabase
    .from("contacts")
    .select("email, first_name")
    .eq("id", contactId)
    .single();

  if (!contact) return { error: "Contact introuvable." };

  // Get current user (agent) for sent_by
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let agentId: string | null = null;
  if (user) {
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", user.id)
      .single();
    agentId = agent?.id || null;
  }

  // Get agency name
  const { data: settings } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "agency_name")
    .single();
  const agencyName = settings?.value || "Notre agence";

  // Send email via Resend
  try {
    const { sendContactReply } = await import("@repo/shared/resend");
    await sendContactReply({
      to: contact.email,
      agencyName,
      contactFirstName: contact.first_name,
      message,
    });
  } catch (e) {
    console.error("[reply] Erreur Resend :", e);
    return { error: "Erreur lors de l'envoi de l'email." };
  }

  // Save reply in DB
  const { error } = await supabase.from("contact_replies").insert({
    contact_id: contactId,
    message,
    sent_by: agentId,
  });

  if (error) return { error: safeError(error, "contacts.reply") };

  // Auto-update contact status to "traité" if still "nouveau" or "lu"
  await supabase
    .from("contacts")
    .update({ status: "traité" })
    .eq("id", contactId)
    .in("status", ["nouveau", "lu"]);

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
  return { success: true };
}

export async function deleteContact(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("contacts").delete().eq("id", id);

  if (error) {
    return { error: safeError(error, "contacts") };
  }

  revalidatePath("/contacts");
  return { success: true };
}
