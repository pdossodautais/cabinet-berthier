import { createClient } from "@repo/shared/supabase/server";
import type { Estimation } from "@repo/shared/supabase/types";

import { EstimationsTable } from "./estimations-table";

export const dynamic = "force-dynamic";

export default async function AdminEstimationsPage() {
  const supabase = await createClient();

  const { data: estimations } = await supabase
    .from("estimations")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (estimations as Estimation[] | null) ?? [];

  const newCount = rows.filter((e) => e.status === "nouveau").length;

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estimations</h1>
        <p className="text-muted-foreground text-sm">
          {rows.length} demande{rows.length > 1 ? "s" : ""} d&apos;estimation
          {newCount > 0
            ? ` — ${newCount} nouvelle${newCount > 1 ? "s" : ""}`
            : ""}
          .
        </p>
      </div>
      <EstimationsTable data={rows} />
    </div>
  );
}
