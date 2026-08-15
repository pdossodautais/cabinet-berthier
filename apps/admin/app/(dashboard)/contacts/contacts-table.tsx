"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { ContactWithProperty } from "@repo/shared/supabase/types";
import { CONTACT_STATUSES } from "@repo/shared/constants";

import { Avatar, AvatarFallback } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

import {
  StatusBadge,
  CONTACT_STATUS_TONES,
} from "@/components/status-badge";
import { updateContactStatus } from "@/lib/actions/contacts";
import { DeleteContactButton } from "@/components/delete-contact-button";
import { ExportCsvButton } from "@/components/export-csv-button";
import { exportContacts } from "@/lib/actions/export";
import { DataTable } from "@/components/data-table";
import {
  ContactDetailDialog,
  type ContactReplyWithAgent,
} from "@/components/contact-detail-dialog";

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n).trimEnd() + "…" : s;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type RowMeta = {
  repliesByContact: Record<string, ContactReplyWithAgent[]>;
};

const columns: ColumnDef<ContactWithProperty>[] = [
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
        Contact
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const contact = row.original;
      const meta = table.options.meta as RowMeta | undefined;
      const replies = meta?.repliesByContact?.[contact.id] ?? [];
      return (
        <ContactDetailDialog contact={contact} replies={replies}>
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {contact.first_name[0]}
                {contact.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {contact.first_name} {contact.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {contact.email}
              </p>
            </div>
          </div>
        </ContactDetailDialog>
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
    id: "property",
    accessorFn: (row) => row.properties?.title ?? "",
    header: "Bien concerné",
    cell: ({ row }) => (
      <span className="block max-w-[220px] truncate text-sm text-muted-foreground">
        {row.original.properties?.title || "—"}
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
        Reçu le
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
        options={CONTACT_STATUSES}
        toneByValue={CONTACT_STATUS_TONES}
        onChange={(v) => updateContactStatus(row.original.id, v)}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const contact = row.original;
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
                    href={`/contacts?preview=${contact.id}`}
                    scroll={false}
                  />
                }
              >
                Ouvrir le détail
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<a href={`mailto:${contact.email}`} />}
              >
                Envoyer un email
              </DropdownMenuItem>
              {contact.phone && (
                <DropdownMenuItem
                  render={<a href={`tel:${contact.phone}`} />}
                >
                  Appeler
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DeleteContactButton
                id={contact.id}
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

export function ContactsTable({
  data,
  repliesByContact = {},
}: {
  data: ContactWithProperty[];
  repliesByContact?: Record<string, ContactReplyWithAgent[]>;
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Rechercher un contact…"
      toolbarActions={
        <ExportCsvButton fetchData={exportContacts} filename="contacts.csv" />
      }
      initialPageSize={10}
      meta={{ repliesByContact } satisfies RowMeta}
      // Par défaut : essentiel uniquement (nom, téléphone, statut + actions).
      // Tout le reste reste dispo via le toggle "Colonnes".
      initialColumnVisibility={{
        property: false,
        message: false,
        created_at: false,
      }}
    />
  );
}
