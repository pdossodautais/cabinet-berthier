"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type {
  Property,
  PropertyMedia,
} from "@repo/shared/supabase/types";
import {
  formatPrice,
  formatSurface,
  getPropertyTypeLabel,
  getTransactionTypeLabel,
} from "@repo/shared/utils";

import { Badge } from "@repo/ui/badge";
import { Button, buttonVariants } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { PropertyImage } from "@repo/ui/property-image";
import { cn } from "@repo/ui/utils";

import { DataTable } from "@/components/data-table";
import { DeletePropertyButton } from "@/components/delete-property-button";
import { toggleSoldStatus } from "@/lib/actions/properties";

type BienRow = Property & {
  property_media: Pick<PropertyMedia, "url" | "position">[];
};

function firstImage(p: BienRow) {
  return p.property_media?.slice().sort((a, b) => a.position - b.position)[0]
    ?.url;
}

const columns: ColumnDef<BienRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Bien
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => {
      const property = row.original;
      return (
        <Link
          href={`/biens/${property.id}`}
          className="flex items-center gap-3 min-w-0"
        >
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
            <PropertyImage
              src={firstImage(property) || ""}
              alt={property.title}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{property.title}</p>
            <p className="text-xs text-muted-foreground">
              {property.city} ({property.postal_code})
            </p>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm">
        {getPropertyTypeLabel(row.original.type)}
      </span>
    ),
  },
  {
    accessorKey: "transaction_type",
    header: "Transaction",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {getTransactionTypeLabel(row.original.transaction_type)}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Prix
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatPrice(row.original.price)}
        {row.original.transaction_type === "location" && (
          <span className="text-muted-foreground font-normal"> /mois</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "surface",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Surface
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatSurface(row.original.surface)}
      </span>
    ),
  },
  {
    accessorKey: "bedrooms",
    header: "Chambres",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.bedrooms ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "bathrooms",
    header: "Salles de bain",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.bathrooms ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "postal_code",
    header: "Code postal",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.postal_code || "—"}
      </span>
    ),
  },
  {
    accessorKey: "energy_rating",
    header: "DPE",
    cell: ({ row }) =>
      row.original.energy_rating ? (
        <Badge variant="outline" className="font-mono font-normal">
          {row.original.energy_rating}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "ghg_rating",
    header: "GES",
    cell: ({ row }) =>
      row.original.ghg_rating ? (
        <Badge variant="outline" className="font-mono font-normal">
          {row.original.ghg_rating}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Créé le
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {new Date(row.original.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    id: "status",
    header: "Statut",
    cell: ({ row }) => {
      const p = row.original;
      const soldLabel = p.transaction_type === "location" ? "Loué" : "Vendu";
      // Statuts cumulables : un bien peut être Publié + Vendu (badge sur le
      // site public), ou Brouillon + Vedette + Vendu, etc.
      return (
        <div className="flex flex-wrap items-center gap-1">
          {p.is_published ? (
            <Badge>Publié</Badge>
          ) : (
            <Badge variant="outline">Brouillon</Badge>
          )}
          {p.is_featured && <Badge variant="secondary">Vedette</Badge>}
          {p.sold_at && <Badge variant="destructive">{soldLabel}</Badge>}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const property = row.original;
      // URL du site public — on préfère NEXT_PUBLIC_SITE_URL à une URL
      // relative : l'admin et le site public sont deux Vercel projects
      // distincts, donc un lien relatif depuis l'admin ne mène nulle
      // part (404 admin). Fallback chaîne vide → le lien devient
      // inerte si la variable n'est pas définie.
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      const publicUrl = siteUrl
        ? `${siteUrl.replace(/\/+$/, "")}/biens/${property.slug}`
        : null;
      const isSold = Boolean(property.sold_at);
      const soldVerb =
        property.transaction_type === "location" ? "loué" : "vendu";

      async function onToggleSold(e: React.MouseEvent) {
        e.preventDefault();
        const result = await toggleSoldStatus(property.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success(
          result.sold
            ? `Bien marqué comme ${soldVerb}`
            : "Bien réactivé",
        );
      }

      return (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 data-[state=open]:bg-muted"
                />
              }
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem render={<Link href={`/biens/${property.id}`} />}>
                Modifier
              </DropdownMenuItem>
              {property.is_published && publicUrl && (
                <DropdownMenuItem
                  render={
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Voir en ligne
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onToggleSold}>
                {isSold
                  ? "Réactiver le bien"
                  : `Marquer comme ${soldVerb}`}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeletePropertyButton
                id={property.id}
                title={property.title}
                renderAsMenuItem
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function BiensTable({
  data,
  createHref = "/biens/nouveau",
}: {
  data: BienRow[];
  createHref?: string;
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="title"
      searchPlaceholder="Rechercher un bien…"
      toolbarActions={
        <Link
          href={createHref}
          className={cn(buttonVariants({ size: "sm" }), "h-9")}
        >
          Ajouter un bien
        </Link>
      }
      initialPageSize={10}
      // Par défaut : bien (titre+ville), prix, transaction, statut + actions.
      // Tout le reste (type, surface, chambres, SdB, CP, DPE, GES, date) reste
      // dispo via le toggle "Colonnes".
      initialColumnVisibility={{
        type: false,
        surface: false,
        bedrooms: false,
        bathrooms: false,
        postal_code: false,
        energy_rating: false,
        ghg_rating: false,
        created_at: false,
      }}
    />
  );
}
