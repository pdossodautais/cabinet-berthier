"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { Estimation } from "@repo/shared/supabase/types";
import { getPropertyTypeLabel } from "@repo/shared/utils";
import { ESTIMATION_STATUSES } from "@repo/shared/constants";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

import { DataTable } from "@/components/data-table";
import { DeleteEstimationButton } from "@/components/delete-estimation-button";
import { EstimationDetailDialog } from "@/components/estimation-detail-dialog";
import {
  StatusBadge,
  ESTIMATION_STATUS_TONES,
} from "@/components/status-badge";
import { updateEstimationStatus } from "@/lib/actions/estimations";

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n).trimEnd() + "…" : s;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const columns: ColumnDef<Estimation>[] = [
  {
    id: "name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Demandeur
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => {
      const estimation = row.original;
      return (
        <EstimationDetailDialog estimation={estimation}>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">
              {estimation.first_name} {estimation.last_name}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {estimation.email}
            </span>
          </div>
        </EstimationDetailDialog>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) =>
      row.original.phone ? (
        <a
          href={`tel:${row.original.phone}`}
          className="text-sm tabular-nums hover:underline"
        >
          {row.original.phone}
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    id: "address",
    accessorFn: (row) => `${row.address} ${row.city} ${row.postal_code}`,
    header: "Adresse",
    cell: ({ row }) => (
      <div className="flex max-w-[260px] flex-col">
        <span
          className="truncate text-sm"
          title={row.original.address}
        >
          {truncate(row.original.address, 60)}
        </span>
        <span className="truncate text-xs text-muted-foreground tabular-nums">
          {row.original.city} ({row.original.postal_code})
        </span>
      </div>
    ),
  },
  {
    accessorKey: "property_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {getPropertyTypeLabel(row.original.property_type)}
      </Badge>
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
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.surface ? `${row.original.surface} m²` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "rooms",
    header: "Pièces",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.rooms ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <p className="max-w-[200px] truncate text-sm text-muted-foreground">
        {row.original.message ? truncate(row.original.message, 120) : "—"}
      </p>
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
        Reçue le
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <StatusBadge
        value={row.original.status}
        options={ESTIMATION_STATUSES}
        toneByValue={ESTIMATION_STATUS_TONES}
        onChange={(v) => updateEstimationStatus(row.original.id, v)}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const estimation = row.original;
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
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                render={
                  <Link
                    href={`/estimations?preview=${estimation.id}`}
                    scroll={false}
                  />
                }
              >
                Ouvrir le détail
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<a href={`mailto:${estimation.email}`} />}
              >
                Envoyer un email
              </DropdownMenuItem>
              {estimation.phone && (
                <DropdownMenuItem
                  render={<a href={`tel:${estimation.phone}`} />}
                >
                  Appeler
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DeleteEstimationButton
                id={estimation.id}
                redirectAfter={false}
                renderAsMenuItem
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function EstimationsTable({ data }: { data: Estimation[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Rechercher une estimation…"
      initialPageSize={10}
      // Par défaut : essentiel (demandeur, téléphone, statut). Reste dispo
      // via le toggle "Colonnes" (adresse, type, surface, pièces, message…).
      initialColumnVisibility={{
        address: false,
        property_type: false,
        surface: false,
        rooms: false,
        message: false,
        created_at: false,
      }}
    />
  );
}
