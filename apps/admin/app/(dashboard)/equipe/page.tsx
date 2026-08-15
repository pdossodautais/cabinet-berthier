import { createClient } from "@repo/shared/supabase/server";
import type { Agent } from "@repo/shared/supabase/types";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";

import { AgentFormModal } from "@/components/agent-form-modal";
import { getCurrentUser } from "@/lib/auth";

import { EquipeTable } from "./equipe-table";

export const dynamic = "force-dynamic";

export default async function AdminEquipePage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .order("last_name");

  const rows = (agents as Agent[] | null) ?? [];
  const activeCount = rows.filter((a) => a.is_active).length;

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Équipe</h1>
        <p className="text-muted-foreground text-sm">
          {rows.length} membre{rows.length > 1 ? "s" : ""}
          {rows.length > 0
            ? ` — ${activeCount} actif${activeCount > 1 ? "s" : ""}`
            : ""}
          .
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Users className="size-10 opacity-30" strokeWidth={1.3} />
            <p className="font-medium">
              Aucun membre dans l&apos;équipe
            </p>
            <p className="text-muted-foreground max-w-sm text-sm">
              Ajoutez votre premier agent pour lui attribuer des biens et lui
              permettre de répondre aux contacts.
            </p>
            <div className="mt-2">
              <AgentFormModal />
            </div>
          </div>
        </div>
      ) : (
        <EquipeTable agents={rows} />
      )}
    </div>
  );
}
