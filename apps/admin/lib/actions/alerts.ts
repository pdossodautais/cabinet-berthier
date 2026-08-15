"use server";

import { createClient } from "@repo/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { safeError } from "../safe-error";

export async function toggleAlertActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("property_alerts")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { error: safeError(error, "alerts") };
  }

  revalidatePath("/alertes");
  return { success: true };
}

export async function deleteAlert(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("property_alerts").delete().eq("id", id);

  if (error) {
    return { error: safeError(error, "alerts") };
  }

  revalidatePath("/alertes");
  return { success: true };
}
