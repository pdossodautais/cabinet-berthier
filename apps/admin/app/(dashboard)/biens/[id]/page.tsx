import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@repo/shared/supabase/server";
import { updateProperty } from "@/lib/actions/properties";
import { PropertyForm } from "@/components/property-form";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: property },
    { data: media },
    { data: agents },
    { data: documents },
  ] = await Promise.all([
    supabase.from("properties").select("*").eq("id", id).single(),
    supabase
      .from("property_media")
      .select("*")
      .eq("property_id", id)
      .order("position"),
    supabase
      .from("agents")
      .select("*")
      .eq("is_active", true)
      .order("last_name"),
    supabase
      .from("property_documents")
      .select("*")
      .eq("property_id", id)
      .order("position"),
  ]);

  if (!property) notFound();

  const updateWithId = updateProperty.bind(null, id);
  const reference = `MB-${property.id.replace(/-/g, "").slice(-4).toUpperCase()}`;

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Biens · Édition
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight truncate">
              {property.title}
            </h1>
            {property.is_published ? (
              <Badge>Publié</Badge>
            ) : (
              <Badge variant="outline">Brouillon</Badge>
            )}
            {property.is_featured && (
              <Badge variant="secondary">Vedette</Badge>
            )}
            {property.sold_at && (
              <Badge variant="destructive">
                {property.transaction_type === "location" ? "Loué" : "Vendu"}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {property.city} ({property.postal_code}) · Référence{" "}
            <span className="font-mono">{reference}</span>
          </p>
        </div>
        {/* « Voir en ligne » a migré dans le menu ⋯ de chaque ligne du
            tableau /biens — il est plus utile là où on choisit le bien
            qu'une fois déjà dans l'édition. */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/biens" />}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Retour
          </Button>
        </div>
      </div>

      <PropertyForm
        property={property}
        agents={agents || []}
        media={media || []}
        documents={documents || []}
        action={updateWithId}
      />
    </div>
  );
}
