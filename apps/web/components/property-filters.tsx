"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@repo/ui/input";
import { Button, buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/select";
import { ArrowUpDown, Map, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { AlertForm } from "@/components/alert-form";

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "ancien", label: "Plus anciens" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
  { value: "surface_desc", label: "Plus grands" },
] as const;
import { TRANSACTION_TYPES, PROPERTY_TYPES, ROOM_OPTIONS } from "@repo/shared/constants";

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/biens?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/biens");
  }, [router]);

  const currentTransaction = searchParams.get("transaction") || "";
  const currentType = searchParams.get("type") || "";
  const currentRooms = searchParams.get("pieces") || "";
  const currentSort = searchParams.get("tri") || "recent";

  const transactionLabel =
    TRANSACTION_TYPES.find((t) => t.value === currentTransaction)?.label ||
    "Vente & Location";
  const typeLabel =
    PROPERTY_TYPES.find((t) => t.value === currentType)?.label || "Tous types";
  const roomsLabel =
    ROOM_OPTIONS.find((r) => r.value === currentRooms)?.label || "Pièces";

  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([key]) => key !== "page"
  );

  return (
    <div key={searchParams.toString()} className="space-y-3 mb-6">
      {/* Row 0: Full-text search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Rechercher par mot-clé"
          placeholder="Rechercher par mot-clé (titre, ville, description...)"
          defaultValue={searchParams.get("q") || ""}
          onBlur={(e) => updateFilter("q", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateFilter("q", e.currentTarget.value);
          }}
          className="pl-9"
        />
      </div>

      {/* Row 1: Type filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={currentTransaction || "all"}
          onValueChange={(v) =>
            updateFilter("transaction", !v || v === "all" ? "" : v)
          }
        >
          <SelectTrigger aria-label="Type de transaction" className="w-[160px]">
            <span className="flex flex-1 text-left truncate">
              {transactionLabel}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vente & Location</SelectItem>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentType || "all"}
          onValueChange={(v) =>
            updateFilter("type", !v || v === "all" ? "" : v)
          }
        >
          <SelectTrigger aria-label="Type de bien" className="w-[160px]">
            <span className="flex flex-1 text-left truncate">
              {typeLabel}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            {PROPERTY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentRooms || "all"}
          onValueChange={(v) =>
            updateFilter("pieces", !v || v === "all" ? "" : v)
          }
        >
          <SelectTrigger aria-label="Nombre de pièces" className="w-[120px]">
            <span className="flex flex-1 text-left truncate">
              {roomsLabel}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {ROOM_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label} {r.value === "5" ? "pièces et +" : r.value === "1" ? "pièce" : "pièces"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          aria-label="Filtrer par ville"
          placeholder="Ville..."
          defaultValue={searchParams.get("ville") || ""}
          onBlur={(e) => updateFilter("ville", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateFilter("ville", e.currentTarget.value);
          }}
          className="w-[160px]"
        />
      </div>

      {/* Row 2: Price & surface range */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
        <Input
          type="number"
          aria-label="Prix minimum en euros"
          placeholder="Prix min"
          defaultValue={searchParams.get("prix_min") || ""}
          onBlur={(e) => updateFilter("prix_min", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateFilter("prix_min", e.currentTarget.value);
          }}
          className="w-[130px]"
          min={0}
        />
        <span className="text-muted-foreground text-sm">—</span>
        <Input
          type="number"
          aria-label="Prix maximum en euros"
          placeholder="Prix max"
          defaultValue={searchParams.get("prix_max") || ""}
          onBlur={(e) => updateFilter("prix_max", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateFilter("prix_max", e.currentTarget.value);
          }}
          className="w-[130px]"
          min={0}
        />
        <span className="text-muted-foreground text-sm hidden sm:inline">€</span>

        <div className="hidden sm:block w-px h-5 bg-border mx-1" />

        <Input
          type="number"
          aria-label="Surface minimum en mètres carrés"
          placeholder="Surface min (m²)"
          defaultValue={searchParams.get("surface_min") || ""}
          onBlur={(e) => updateFilter("surface_min", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateFilter("surface_min", e.currentTarget.value);
          }}
          className="w-[160px]"
          min={0}
        />

        <div className="hidden sm:block w-px h-5 bg-border mx-1" />

        <Select
          value={currentSort}
          onValueChange={(v) => updateFilter("tri", !v || v === "recent" ? "" : v)}
        >
          <SelectTrigger aria-label="Trier les résultats" className="w-[170px]">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 shrink-0" />
            <span className="flex flex-1 text-left truncate">
              {SORT_OPTIONS.find((s) => s.value === currentSort)?.label || "Plus récents"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Link href="/biens/carte" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "min-h-12")}>
          <Map className="h-3.5 w-3.5 mr-1" />
          Carte
        </Link>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground min-h-12"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Alert subscription */}
      <div className="flex">
        <AlertForm />
      </div>
    </div>
  );
}
