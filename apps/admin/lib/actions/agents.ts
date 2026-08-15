"use server";

import { createClient, createServiceClient } from "@repo/shared/supabase/server";
import { sendAgentInvitation } from "@repo/shared/resend";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { revalidateWeb } from "../revalidate-web";
import { parseAgentForm, formatZodError } from "../validations";
import { safeError } from "../safe-error";

/**
 * Origine utilisée pour construire les liens dans les emails
 * (invitation, welcome). Priorité à `NEXT_PUBLIC_ADMIN_URL` pour que
 * même un admin lancé en local puisse envoyer des invitations dont
 * le lien pointe vers l'admin en prod — l'utilisateur qui active son
 * compte tombe alors sur un dashboard accessible depuis n'importe où.
 * Fallback : headers de la request (dev sans env var), puis
 * `localhost:3001` en dernier recours.
 */
async function getOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3001";
  const proto = headersList.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

async function createInviteAndSend({
  adminClient,
  email,
  firstName,
  lastName,
  origin,
}: {
  adminClient: Awaited<ReturnType<typeof createServiceClient>>;
  email: string;
  firstName: string;
  lastName: string;
  origin: string;
}) {
  // 1. Créer l'utilisateur sans envoyer d'email
  const { data: userData, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

  if (createError) {
    return { error: safeError(createError, "agents.create") };
  }

  // 2. Générer un lien de récupération (pas d'email auto Supabase)
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

  if (linkError) {
    // Rollback : supprimer l'utilisateur créé
    await adminClient.auth.admin.deleteUser(userData.user.id);
    return { error: safeError(linkError, "agents.link") };
  }

  // 3. Récupérer le nom de l'agence
  const { data: settings } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "agency_name")
    .single();
  const agencyName = settings?.value || "Notre agence";

  // 4. Envoyer l'email d'invitation via Resend avec l'action_link Supabase
  const { error: emailError } = await sendAgentInvitation({
    to: email,
    agencyName,
    firstName,
    inviteUrl: linkData.properties.action_link,
  });

  if (emailError) {
    console.error("[invitation] Erreur Resend :", emailError);
    await adminClient.auth.admin.deleteUser(userData.user.id);
    return { error: safeError(emailError, "agents.email") };
  }

  return { userId: userData.user.id };
}

async function generateResendLink({
  adminClient,
  email,
  firstName,
  origin,
}: {
  adminClient: Awaited<ReturnType<typeof createServiceClient>>;
  email: string;
  firstName: string;
  origin: string;
}) {
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

  if (linkError) {
    return { error: safeError(linkError, "agents.resend-link") };
  }

  const { data: settings } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "agency_name")
    .single();
  const agencyName = settings?.value || "Notre agence";

  await sendAgentInvitation({
    to: email,
    agencyName,
    firstName,
    inviteUrl: linkData.properties.action_link,
  });

  return { success: true };
}

export async function createAgent(formData: FormData) {
  const parsed = parseAgentForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const supabase = await createClient();
  const { email, first_name: firstName } = parsed.data;
  const sendInvite = formData.get("send_invite") === "on";

  let userId: string | null = null;

  if (sendInvite) {
    const adminClient = await createServiceClient();
    const origin = await getOrigin();

    const result = await createInviteAndSend({
      adminClient,
      email,
      firstName,
      lastName: parsed.data.last_name,
      origin,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    userId = result.userId;
  }

  const { data: insertedAgent, error } = await supabase
    .from("agents")
    .insert({
      ...parsed.data,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) {
    // Rollback : supprimer l'utilisateur auth si l'insert agent échoue
    if (userId) {
      const adminClient = await createServiceClient();
      await adminClient.auth.admin.deleteUser(userId);
    }
    return { error: safeError(error, "agents") };
  }

  // Pré-créer les rows de préférences de notification pour ce nouvel agent.
  // Defaults asymétriques (cohérent avec la lecture côté UI) : contact ON,
  // estimation OFF — un nouvel agent reçoit les contacts entrants mais pas
  // le flux d'estimations (souvent réservé à l'admin / la direction). Sans
  // ces rows, le switch dans /profil partirait du « défaut UI » et au premier
  // toggle l'utilisateur découvrirait un comportement implicite.
  if (insertedAgent?.id) {
    await supabase.from("notification_preferences").insert([
      { agent_id: insertedAgent.id, event_type: "contact", enabled: true },
      { agent_id: insertedAgent.id, event_type: "estimation", enabled: false },
    ]);
  }

  revalidatePath("/equipe");
  await revalidateWeb("agents");
  return { success: true };
}

export async function updateAgent(id: string, formData: FormData) {
  const parsed = parseAgentForm(formData);
  if (!parsed.success) return { error: formatZodError(parsed) };

  const supabase = await createClient();

  const { error } = await supabase
    .from("agents")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return { error: safeError(error, "agents") };
  }

  revalidatePath("/equipe");
  await revalidateWeb("agents");
  return { success: true };
}

export async function deleteAgent(id: string) {
  const supabase = await createClient();

  // Récupérer le user_id avant suppression
  const { data: agent } = await supabase
    .from("agents")
    .select("user_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("agents").delete().eq("id", id);

  if (error) {
    return { error: safeError(error, "agents") };
  }

  // Supprimer l'utilisateur auth associé
  if (agent?.user_id) {
    const adminClient = await createServiceClient();
    await adminClient.auth.admin.deleteUser(agent.user_id);
  }

  revalidatePath("/equipe");
  await revalidateWeb("agents");
  return { success: true };
}

export async function resendAgentInvite(id: string) {
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("email, first_name, user_id")
    .eq("id", id)
    .single();

  if (!agent) return { error: "Agent introuvable." };
  if (!agent.user_id) return { error: "Cet agent n'a pas de compte associé." };

  const adminClient = await createServiceClient();
  const origin = await getOrigin();

  const result = await generateResendLink({
    adminClient,
    email: agent.email,
    firstName: agent.first_name,
    origin,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true };
}
