import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@repo/shared/supabase/server";
import { NewPropertyClient } from "./new-property-client";
import { Button } from "@repo/ui/button";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  const supabase = await createClient();
  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("last_name");

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Biens
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Nouveau bien</h1>
          <p className="text-muted-foreground text-sm">
            Renseignez les informations, ajoutez photos et documents — tout sera publié ensemble.
          </p>
        </div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/biens" />}>
          <ArrowLeft className="mr-1.5 size-4" />
          Retour
        </Button>
      </div>

      <NewPropertyClient agents={agents || []} />
    </div>
  );
}
