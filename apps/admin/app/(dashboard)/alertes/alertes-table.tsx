"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import {
  getPropertyTypeLabel,
  getTransactionTypeLabel,
} from "@repo/shared/utils";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";

import { AlertActions } from "@/components/alert-actions";
import {
  AlertDetailDialog,
  type NotifiedProperty,
} from "@/components/alert-detail-dialog";
import { DataTable } from "@/components/data-table";

export interface AlertRow {
  id: string;
  created_at: string;
  email: string;
  transaction_type: string | null;
  property_type: string | null;
  city: string | null;
  prix_max: number | null;
  surface_min: number | null;
  rooms: number | null;
  is_active: boolean;
  notified_property_ids: string[] | null;
}

type RowMeta = {
  propertiesById: Record<string, NotifiedProperty>;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

const columns: ColumnDef<AlertRow>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Email
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const alert = row.original;
      const meta = table.options.meta as RowMeta | undefined;
      // Résout les biens notifiés à partir du map global — garde le payload
      // légèr côté client (pas de duplication par ligne).
      const notified = (alert.notified_property_ids ?? [])
        .map((id) => meta?.propertiesById[id])
        .filter((p): p is NotifiedProperty => !!p);
      return (
        <AlertDetailDialog alert={alert} notifiedProperties={notified}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <p className="font-medium truncate">{alert.email}</p>
              {(alert.notified_property_ids ?? []).length > 0 && (
                <p className="text-xs text-muted-foreground truncate">
                  {alert.notified_property_ids!.length} bien
                  {alert.notified_property_ids!.length > 1 ? "s" : ""} notifié
                  {alert.notified_property_ids!.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </AlertDetailDialog>
      );
    },
  },
  {
    accessorKey: "transaction_type",
    header: "Transaction",
    cell: ({ row }) =>
      row.original.transaction_type ? (
        <Badge variant="outline" className="font-normal">
          {getTransactionTypeLabel(row.original.transaction_type)}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    accessorKey: "property_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.property_type
          ? getPropertyTypeLabel(row.original.property_type)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "city",
    header: "Ville",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.city || "—"}</span>
    ),
  },
  {
    accessorKey: "prix_max",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Prix max
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatPrice(row.original.prix_max)}
      </span>
    ),
  },
  {
    accessorKey: "surface_min",
    header: "Surface min",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.surface_min ? `${row.original.surface_min} m²` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "rooms",
    header: "Pièces",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.rooms
          ? `${row.original.rooms}${row.original.rooms > 1 ? "+" : ""}`
          : "—"}
      </span>
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
        Créée le
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm tabular-nums">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Statut",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge>Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <AlertActions
          id={row.original.id}
          email={row.original.email}
          isActive={row.original.is_active}
        />
      </div>
    ),
  },
];

export function AlertesTable({
  data,
  propertiesById,
}: {
  data: AlertRow[];
  propertiesById: Record<string, NotifiedProperty>;
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="email"
      searchPlaceholder="Rechercher par email…"
      initialPageSize={10}
      meta={{ propertiesById } satisfies RowMeta}
      // Par défaut : email, prix max, statut + actions. Le reste
      // (transaction, type, ville, surface, pièces, date) reste dispo
      // via le toggle "Colonnes".
      initialColumnVisibility={{
        transaction_type: false,
        property_type: false,
        city: false,
        surface_min: false,
        rooms: false,
        created_at: false,
      }}
    />
  );
}
