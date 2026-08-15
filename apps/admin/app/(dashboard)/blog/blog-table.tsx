"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ImageOff, MoreHorizontal, Plus } from "lucide-react";
import type { Agent, Post } from "@repo/shared/supabase/types";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

import { BlogFormDialog } from "@/components/blog-form-dialog";
import { DataTable } from "@/components/data-table";
import { DeletePostButton } from "@/components/delete-post-button";

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n).trimEnd() + "…" : s;

export type BlogRow = Post & {
  agents: Pick<Agent, "first_name" | "last_name"> | null;
};

type RowMeta = {
  agents: Agent[];
};

const columns: ColumnDef<BlogRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-2 h-8"
      >
        Article
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    ),
    cell: ({ row, table }) => {
      const post = row.original;
      const meta = table.options.meta as RowMeta | undefined;
      return (
        <BlogFormDialog post={post} agents={meta?.agents ?? []}>
          <button
            type="button"
            aria-label={`Modifier « ${post.title} »`}
            className="flex w-full cursor-pointer items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
              {post.cover_url ? (
                <Image
                  src={post.cover_url}
                  alt={post.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-4" />
                </div>
              )}
            </div>
            <div className="min-w-0 max-w-[280px] md:max-w-[360px] lg:max-w-[420px]">
              <p className="font-medium truncate">{post.title}</p>
              {post.excerpt && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {truncate(post.excerpt, 120)}
                </p>
              )}
            </div>
          </button>
        </BlogFormDialog>
      );
    },
  },
  {
    id: "author",
    header: "Auteur",
    cell: ({ row }) => {
      const agents = row.original.agents;
      return (
        <span className="text-sm">
          {agents ? `${agents.first_name} ${agents.last_name}` : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <code className="block max-w-[200px] truncate font-mono text-xs text-muted-foreground">
        {row.original.slug}
      </code>
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
    accessorKey: "updated_at",
    header: "Mis à jour",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {new Date(row.original.updated_at).toLocaleDateString("fr-FR", {
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
    cell: ({ row }) =>
      row.original.is_published ? (
        <Badge>Publié</Badge>
      ) : (
        <Badge variant="outline">Brouillon</Badge>
      ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const post = row.original;
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                render={
                  <Link
                    href={`/blog?preview=${post.id}`}
                    scroll={false}
                  />
                }
              >
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeletePostButton
                id={post.id}
                title={post.title}
                renderAsMenuItem
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function BlogTable({
  data,
  agents,
}: {
  data: BlogRow[];
  agents: Agent[];
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="title"
      searchPlaceholder="Rechercher un article…"
      toolbarActions={
        <BlogFormDialog agents={agents}>
          <Button size="sm" className="h-9">
            <Plus className="size-4" />
            Nouvel article
          </Button>
        </BlogFormDialog>
      }
      initialPageSize={10}
      meta={{ agents } satisfies RowMeta}
      // Par défaut : article (titre+extrait), date, statut + actions.
      // Tout le reste (auteur, slug, mis à jour) reste dispo via "Colonnes".
      initialColumnVisibility={{
        author: false,
        slug: false,
        updated_at: false,
      }}
    />
  );
}
