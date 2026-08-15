"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ExternalLink, Star } from "lucide-react";
import type { Testimonial } from "@repo/shared/supabase/types";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";

import { DataTable } from "@/components/data-table";
import { TestimonialFormModal } from "@/components/testimonial-form-modal";

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n).trimEnd() + "…" : s;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const columns: ColumnDef<Testimonial>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Client
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => {
      const t = row.original;
      return (
        <TestimonialFormModal testimonial={t}>
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-9">
              {t.photo_url && (
                <AvatarImage src={t.photo_url} alt={t.name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {initials(t.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{t.name}</p>
              {t.role && (
                <p className="text-xs text-muted-foreground truncate">
                  {t.role}
                </p>
              )}
            </div>
          </div>
        </TestimonialFormModal>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Note",
    cell: ({ row }) => (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={
              value <= row.original.rating
                ? "size-3.5 fill-yellow-400 text-yellow-400"
                : "size-3.5 text-muted-foreground/30"
            }
          />
        ))}
      </div>
    ),
  },
  {
    accessorKey: "content",
    header: "Témoignage",
    cell: ({ row }) => (
      <p className="max-w-md truncate text-sm text-muted-foreground">
        {truncate(row.original.content, 140)}
      </p>
    ),
  },
  {
    id: "status",
    header: "Statut",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {row.original.is_published ? (
          <Badge>Publié</Badge>
        ) : (
          <Badge variant="outline">Brouillon</Badge>
        )}
        {row.original.url && (
          <Badge variant="secondary" className="gap-1 font-normal">
            <ExternalLink className="size-3" />
            Lien
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "url",
    header: "URL",
    cell: ({ row }) =>
      row.original.url ? (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-[200px] items-center gap-1 truncate text-xs text-muted-foreground hover:underline"
        >
          <ExternalLink className="size-3 shrink-0" />
          <span className="truncate">{row.original.url}</span>
        </a>
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
        Date
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
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <TestimonialFormModal testimonial={row.original} />
      </div>
    ),
  },
];

export function TestimonialsTable({ data }: { data: Testimonial[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Rechercher un client…"
      toolbarActions={<TestimonialFormModal />}
      initialPageSize={10}
      // Par défaut : client, note, statut + actions. Le reste (extrait,
      // URL, date) reste dispo via le toggle "Colonnes".
      initialColumnVisibility={{
        content: false,
        url: false,
        created_at: false,
      }}
    />
  );
}
