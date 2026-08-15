"use server";

import { createClient } from "@repo/shared/supabase/server";
import { revalidatePath } from "next/cache";
import { slugify } from "@repo/shared/utils";
import { revalidateWeb } from "../revalidate-web";
import { parsePostForm, formatZodError } from "../validations";
import { safeError } from "../safe-error";

export async function createPost(formData: FormData) {
  const parsed = parsePostForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const supabase = await createClient();
  const slug = slugify(parsed.data.title);

  const { error } = await supabase.from("posts").insert({
    ...parsed.data,
    slug,
  });

  if (error) return { error: safeError(error, "posts") };

  revalidatePath("/blog");
  await revalidateWeb("posts");
  return { success: true, slug };
}

export async function updatePost(id: string, formData: FormData) {
  const parsed = parsePostForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: safeError(error, "posts") };

  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
  await revalidateWeb("posts");
  return { success: true };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: safeError(error, "posts") };
  revalidatePath("/blog");
  await revalidateWeb("posts");
  return { success: true };
}

export async function uploadPostCover(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Aucun fichier selectionne." };

  const ext = file.name.split(".").pop();
  const fileName = `covers/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("blog")
    .upload(fileName, file);
  if (uploadError) return { error: safeError(uploadError, "posts.upload") };

  const { data: urlData } = supabase.storage
    .from("blog")
    .getPublicUrl(fileName);
  return { success: true, url: urlData.publicUrl };
}
