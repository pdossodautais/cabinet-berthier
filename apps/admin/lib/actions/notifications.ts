"use server";

import { createClient } from "@repo/shared/supabase/server";
import { getCurrentUser } from "../auth";
import { revalidatePath } from "next/cache";
import type { NotificationEventType } from "@repo/shared/supabase/types";
import { NOTIFICATION_EVENTS } from "@repo/shared/constants";

export async function getNotificationPreferences() {
  const user = await getCurrentUser();
  if (!user?.agentId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("agent_id", user.agentId);

  return data || [];
}

export async function toggleNotificationPreference(
  eventType: NotificationEventType,
  enabled: boolean,
) {
  const user = await getCurrentUser();
  if (!user?.agentId) return { error: "Non autorisé." };

  if (!NOTIFICATION_EVENTS.some((e) => e.value === eventType)) {
    return { error: "Type d'événement invalide." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(
      { agent_id: user.agentId, event_type: eventType, enabled },
      { onConflict: "agent_id,event_type" },
    );

  if (error) {
    return { error: "Erreur lors de la mise à jour." };
  }

  revalidatePath("/profil");
  return { success: true };
}
