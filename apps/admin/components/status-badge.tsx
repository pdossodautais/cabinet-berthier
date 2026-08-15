"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { cn } from "@repo/ui/utils";

export type StatusOption = {
  readonly value: string;
  readonly label: string;
};

export type StatusTone =
  | "nouveau"
  | "info"
  | "success"
  | "neutral"
  | "muted"
  | "warning";

/**
 * StatusBadge — fusion du badge « statut actuel » + du sélecteur pour en
 * changer. Le trigger a le look d'un badge coloré selon la tonalité, et on
 * ouvre le dropdown au clic pour passer au statut suivant.
 */
export function StatusBadge({
  value,
  options,
  toneByValue,
  onChange,
  className,
  disabled,
  successMessage = "Statut mis à jour.",
}: {
  value: string;
  options: readonly StatusOption[];
  toneByValue: Record<string, StatusTone>;
  /** Action serveur ou handler qui renvoie `{ error?: string } | void`. */
  onChange: (value: string) => Promise<{ error?: string } | void>;
  className?: string;
  disabled?: boolean;
  successMessage?: string;
}) {
  const [pending, setPending] = React.useState(false);

  async function handleChange(next: string | null) {
    if (!next || next === value) return;
    setPending(true);
    try {
      const result = await onChange(next);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success(successMessage);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setPending(false);
    }
  }

  const tone = toneByValue[value] ?? "neutral";
  const label = options.find((o) => o.value === value)?.label ?? value;

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={disabled || pending}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          // Reset : le SelectTrigger par défaut est un bouton bordé ; on
          // veut un vrai look de badge pill.
          "!h-7 !px-2.5 !gap-1 !rounded-full !border-transparent !shadow-none !text-xs !font-medium tracking-normal whitespace-nowrap",
          toneClasses[tone],
          pending && "opacity-70",
          className,
        )}
        aria-label="Changer le statut"
      >
        <span
          aria-hidden
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            dotClasses[tone],
          )}
        />
        <SelectValue>{label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  dotClasses[toneByValue[o.value] ?? "neutral"],
                )}
              />
              {o.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Palette de tonalités ─────────────────────────────────────────────
// Chaque ton combine un fond pastel + texte plus foncé + pastille saturée.
// Les classes utilisent les tokens shadcn (destructive, primary, secondary,
// muted) pour respecter le dark mode automatiquement.

const toneClasses: Record<StatusTone, string> = {
  nouveau:
    "!bg-destructive/10 !text-destructive hover:!bg-destructive/15 dark:!bg-destructive/20 dark:!text-destructive-foreground",
  info: "!bg-primary/10 !text-primary hover:!bg-primary/15 dark:!bg-primary/20",
  success:
    "!bg-emerald-500/10 !text-emerald-700 hover:!bg-emerald-500/15 dark:!text-emerald-300 dark:!bg-emerald-500/20",
  warning:
    "!bg-amber-500/10 !text-amber-700 hover:!bg-amber-500/15 dark:!text-amber-300 dark:!bg-amber-500/20",
  neutral:
    "!bg-secondary !text-secondary-foreground hover:!bg-secondary/80",
  muted:
    "!bg-muted !text-muted-foreground hover:!bg-muted/80",
};

const dotClasses: Record<StatusTone, string> = {
  nouveau: "bg-destructive",
  info: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  neutral: "bg-foreground/60",
  muted: "bg-muted-foreground",
};

// ── Presets prêts à l'emploi ─────────────────────────────────────────

export const CONTACT_STATUS_TONES: Record<string, StatusTone> = {
  nouveau: "nouveau",
  lu: "info",
  traité: "success",
  archivé: "muted",
};

export const ESTIMATION_STATUS_TONES: Record<string, StatusTone> = {
  nouveau: "nouveau",
  en_cours: "info",
  terminé: "success",
};
