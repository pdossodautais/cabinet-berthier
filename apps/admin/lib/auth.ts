import { createClient } from "@repo/shared/supabase/server";
import type { AgentRole } from "@repo/shared/supabase/types";

export interface CurrentUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  agentId: string | null;
  role: AgentRole;
}

/**
 * Returns the current authenticated user with their agent profile.
 * If the user is not linked to an agent, role defaults to "admin".
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Try to find linked agent profile
  const { data: agent } = await supabase
    .from("agents")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  return {
    userId: user.id,
    email: user.email || "",
    firstName: user.user_metadata?.first_name || "",
    lastName: user.user_metadata?.last_name || "",
    avatarUrl: user.user_metadata?.avatar_url || null,
    agentId: agent?.id || null,
    role: (agent?.role as AgentRole) || "admin",
  };
}

/**
 * Returns true if the user has admin role.
 */
export function isAdmin(user: CurrentUser): boolean {
  return user.role === "admin";
}
