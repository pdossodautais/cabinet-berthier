import { createClient } from "@repo/shared/supabase/server";

import { AlertesTable, type AlertRow } from "./alertes-table";
import type { NotifiedProperty } from "@/components/alert-detail-dialog";

export const dynamic = "force-dynamic";

export default async function AdminAlertesPage() {
  const supabase = await createClient();

  const { data: alerts } = await supabase
    .from("property_alerts")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (alerts as AlertRow[] | null) ?? [];

  // Batch-fetch les titres des biens déjà notifiés pour toutes les alertes
  // en une seule requête — bien plus efficace qu'un fetch par ligne côté
  // client. L'index par id permet au dialogue détail de reconstruire la
  // liste pour chaque alerte sans N+1.
  const allIds = Array.from(
    new Set(rows.flatMap((a) => a.notified_property_ids ?? [])),
  );
  let propertiesById: Record<string, NotifiedProperty> = {};
  if (allIds.length > 0) {
    const { data: props } = await supabase
      .from("properties")
      .select("id, title, slug, price, city")
      .in("id", allIds);
    if (props) {
      propertiesById = Object.fromEntries(
        props.map((p) => [p.id as string, p as NotifiedProperty]),
      );
    }
  }

  const activeCount = rows.filter((a) => a.is_active).length;

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alertes</h1>
        <p className="text-muted-foreground text-sm">
          {rows.length} alerte{rows.length > 1 ? "s" : ""}
          {rows.length > 0
            ? ` — ${activeCount} active${activeCount > 1 ? "s" : ""}`
            : ""}
          .
        </p>
      </div>
      <AlertesTable data={rows} propertiesById={propertiesById} />
    </div>
  );
}
