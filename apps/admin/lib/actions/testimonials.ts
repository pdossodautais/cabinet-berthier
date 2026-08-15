"use server";

import { createClient } from "@repo/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { revalidateWeb } from "../revalidate-web";
import { parseTestimonialForm, formatZodError } from "../validations";
import { safeError } from "../safe-error";

export async function createTestimonial(formData: FormData) {
  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").insert(parsed.data);
  if (error) return { error: safeError(error, "testimonials") };
  revalidatePath("/temoignages");
  await revalidateWeb("testimonials");
  return { success: true };
}

export async function updateTestimonial(id: string, formData: FormData) {
  const parsed = parseTestimonialForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { error: safeError(error, "testimonials") };
  revalidatePath("/temoignages");
  await revalidateWeb("testimonials");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { error: safeError(error, "testimonials") };
  revalidatePath("/temoignages");
  await revalidateWeb("testimonials");
  return { success: true };
}
