import { createClient } from "@repo/shared/supabase/server";
import type { Testimonial } from "@repo/shared/supabase/types";

import { TestimonialsTable } from "./testimonials-table";

export const dynamic = "force-dynamic";

export default async function AdminTemoignagesPage() {
  const supabase = await createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (testimonials as Testimonial[] | null) || [];

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Témoignages</h1>
        <p className="text-muted-foreground text-sm">
          Recueillez et publiez les avis clients — {rows.length} témoignage
          {rows.length > 1 ? "s" : ""}.
        </p>
      </div>
      <TestimonialsTable data={rows} />
    </div>
  );
}
