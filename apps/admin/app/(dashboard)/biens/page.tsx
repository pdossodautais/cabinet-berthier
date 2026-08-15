import { createClient } from "@repo/shared/supabase/server";
import type { Property, PropertyMedia } from "@repo/shared/supabase/types";

import { BiensTable } from "./biens-table";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_media(url, position)")
    .order("created_at", { ascending: false });

  const rows =
    (properties as unknown as (Property & {
      property_media: Pick<PropertyMedia, "url" | "position">[];
    })[]) || [];

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Biens</h1>
        <p className="text-muted-foreground text-sm">
          Gérez votre catalogue — {rows.length} bien{rows.length > 1 ? "s" : ""}.
        </p>
      </div>
      <BiensTable data={rows} />
    </div>
  );
}
