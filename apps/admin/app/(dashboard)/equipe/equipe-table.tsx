"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Mail, Phone } from "lucide-react";
import type { Agent } from "@repo/shared/supabase/types";
import { getAgentRoleLabel } from "@repo/shared/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";

import { AgentFormModal } from "@/components/agent-form-modal";
import { DataTable } from "@/components/data-table";

const columns: ColumnDef<Agent>[] = [
  {
    accessorKey: "last_name",
    id: "agent",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Membre
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row }) => {
      const a = row.original;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-9 shrink-0">
            {a.photo_url && (
              <AvatarImage
                src={a.photo_url}
                alt={`${a.first_name} ${a.last_name}`}
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-medium">
              {a.first_name[0]}
              {a.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">
              {a.first_name} {a.last_name}
            </p>
            {a.bio && (
              <p className="truncate text-xs text-muted-foreground mt-0.5 max-w-[280px]">
                {a.bio}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => (
      <Badge
        variant={row.original.role === "admin" ? "default" : "secondary"}
        className="font-normal"
      >
        {getAgentRoleLabel(row.original.role)}
      </Badge>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <a
        href={`mailto:${row.original.email}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0"
        title={row.original.email}
      >
        <Mail className="size-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
        <span className="truncate max-w-[220px]">{row.original.email}</span>
      </a>
    ),
  },
  {
    accessorKey: "phone",
    header: "Téléphone",
    cell: ({ row }) =>
      row.original.phone ? (
        <a
          href={`tel:${row.original.phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          title={row.original.phone}
        >
          <Phone className="size-3.5 shrink-0 opacity-60" strokeWidth={1.5} />
          <span className="tabular-nums">{row.original.phone}</span>
        </a>
      ) : (
        <span className="text-sm text-muted-foreground/60">—</span>
      ),
  },
  {
    accessorKey: "is_active",
    header: "Statut",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="outline" className="gap-1.5 font-normal">
          <span
            className="size-1.5 rounded-full bg-emerald-500"
            aria-hidden
          />
          Actif
        </Badge>
      ) : (
        <Badge variant="outline" className="gap-1.5 font-normal opacity-70">
          <span
            className="size-1.5 rounded-full bg-muted-foreground/50"
            aria-hidden
          />
          Inactif
        </Badge>
      ),
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      return value === "active" ? row.original.is_active : !row.original.is_active;
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <AgentFormModal agent={row.original} />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
];

export function EquipeTable({ agents }: { agents: Agent[] }) {
  return (
    <DataTable
      columns={columns}
      data={agents}
      searchColumn="agent"
      searchPlaceholder="Rechercher un membre…"
      toolbarActions={<AgentFormModal />}
      initialPageSize={10}
      // Par défaut : membre, rôle, statut, actions. Email et téléphone
      // restent dispos via le dropdown « Colonnes ».
      initialColumnVisibility={{
        email: false,
        phone: false,
      }}
    />
  );
}
