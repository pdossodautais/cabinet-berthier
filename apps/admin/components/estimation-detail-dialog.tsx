"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import type { Estimation } from "@repo/shared/supabase/types";
import { getPropertyTypeLabel } from "@repo/shared/utils";

import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

import { DeleteEstimationButton } from "@/components/delete-estimation-button";
import { EstimationReplyForm } from "@/components/estimation-reply-form";
import { EstimationStatusBadge } from "@/components/estimation-status-badge";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 text-sm">
      <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 truncate">{children}</dd>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

export function EstimationDetailDialog({
  estimation,
  children,
}: {
  estimation: Estimation;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = searchParams.get("preview") === estimation.id;

  function handleOpenChange(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("preview", estimation.id);
    else if (params.get("preview") === estimation.id)
      params.delete("preview");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const fullName = `${estimation.first_name} ${estimation.last_name}`;
  const fullAddress = `${estimation.address}, ${estimation.postal_code} ${estimation.city}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress,
  )}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="block w-full cursor-pointer rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Voir le détail de ${fullName}`}
          />
        }
      >
        {children}
      </DialogTrigger>
      <DialogContent
        style={{
          maxWidth: "min(34rem, calc(100vw - 2rem))",
          maxHeight: "min(85vh, 48rem)",
        }}
        className="flex flex-col overflow-hidden"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {fullName}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Reçue le {formatDate(estimation.created_at)}</span>
            <span aria-hidden>·</span>
            <EstimationStatusBadge
              estimationId={estimation.id}
              status={estimation.status}
            />
          </div>
        </DialogHeader>

        {/* Coordonnées + Bien à estimer : toujours visibles, pas dans le scroll */}
        <dl className="space-y-2">
          <MetaRow label="Téléphone">
            {estimation.phone ? (
              <a
                href={`tel:${estimation.phone}`}
                className="tabular-nums hover:underline"
              >
                {estimation.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </MetaRow>
          <MetaRow label="Email">
            <a
              href={`mailto:${estimation.email}`}
              className="text-primary hover:underline"
            >
              {estimation.email}
            </a>
          </MetaRow>
        </dl>

        <div className="space-y-3">
          <SectionHeading>Bien à estimer</SectionHeading>
          <dl className="space-y-2">
            <MetaRow label="Adresse">
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <span className="truncate">{fullAddress}</span>
                <ExternalLink className="size-3 shrink-0 opacity-60" />
              </a>
            </MetaRow>
            <MetaRow label="Type">
              {getPropertyTypeLabel(estimation.property_type)}
            </MetaRow>
            <MetaRow label="Surface">
              <span className="tabular-nums">
                {estimation.surface !== null
                  ? `${estimation.surface} m²`
                  : "—"}
              </span>
            </MetaRow>
            <MetaRow label="Pièces">
              <span className="tabular-nums">
                {estimation.rooms !== null ? estimation.rooms : "—"}
              </span>
            </MetaRow>
          </dl>
        </div>

        {/* Message : titre fixe, CONTENU SEUL scrollable et prend l'espace
            restant du Dialog. */}
        {estimation.message && (
          <div className="flex min-h-0 flex-1 flex-col space-y-2">
            <SectionHeading>Message</SectionHeading>
            <p className="scrollbar-thin min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
              {estimation.message}
            </p>
          </div>
        )}

        {/* Form de réponse : email envoyé au demandeur via Resend, bascule
            automatique du statut « nouveau » → « en_cours ». */}
        <EstimationReplyForm estimationId={estimation.id} />

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <DeleteEstimationButton
            id={estimation.id}
            redirectAfter={false}
            variant="destructive"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
