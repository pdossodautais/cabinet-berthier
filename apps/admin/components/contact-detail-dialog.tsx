"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  ContactReply,
  ContactWithProperty,
} from "@repo/shared/supabase/types";

import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

import { ContactReplyForm } from "@/components/contact-reply-form";
import { ContactStatusBadge } from "@/components/contact-status-badge";
import { DeleteContactButton } from "@/components/delete-contact-button";

export type ContactReplyWithAgent = ContactReply & {
  agents: { first_name: string; last_name: string } | null;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Ligne « clé : valeur » façon definition list — aligne tout un bloc de
 * métadonnées sur une colonne label commune, sans fond ni bordure.
 * Préférée à un Card + Label pour la densité et la clarté (skill UI rules
 * §6 whitespace-balance, §8 field-grouping).
 */
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

/**
 * Sous-titre de section, très discret. Tout en minuscules avec un
 * tracking légèrement élargi — pattern Linear/Intercom.
 */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

export function ContactDetailDialog({
  contact,
  replies = [],
  children,
}: {
  contact: ContactWithProperty;
  replies?: ContactReplyWithAgent[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const open = searchParams.get("preview") === contact.id;

  function handleOpenChange(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("preview", contact.id);
    else if (params.get("preview") === contact.id) params.delete("preview");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const fullName = `${contact.first_name} ${contact.last_name}`;

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
      {/* Largeur fixée inline pour bypasser le conflit cn() du DialogContent
          base (max-w-[calc(100%-2rem)] qui gagnait sur sm:max-w-*). */}
      {/* Dialog limité en hauteur. Les titres de section restent fixes, seul
          le CONTENU des zones longues (message, historique) scrolle à
          l'intérieur de chacune. */}
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
            <span>Reçu le {formatDate(contact.created_at)}</span>
            <span aria-hidden>·</span>
            <ContactStatusBadge
              contactId={contact.id}
              status={contact.status}
            />
          </div>
        </DialogHeader>

        <dl className="space-y-2">
          <MetaRow label="Téléphone">
            {contact.phone ? (
              <a
                href={`tel:${contact.phone}`}
                className="tabular-nums hover:underline"
              >
                {contact.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </MetaRow>
          <MetaRow label="Email">
            <a
              href={`mailto:${contact.email}`}
              className="text-primary hover:underline"
            >
              {contact.email}
            </a>
          </MetaRow>
          {contact.properties?.slug && (
            <MetaRow label="Bien">
              <Link
                href={`/biens/${contact.properties.slug}`}
                className="hover:underline"
              >
                {contact.properties.title}
              </Link>
            </MetaRow>
          )}
        </dl>

        {/* Message : titre fixe, CONTENU SEUL scrollable et prend l'espace
            restant du Dialog. C'est la seule zone avec scroll interne. */}
        <div className="flex min-h-0 flex-1 flex-col space-y-2">
          <SectionHeading>Message</SectionHeading>
          <p className="scrollbar-thin min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
            {contact.message || "—"}
          </p>
        </div>

        {/* Conversation : titre fixe, contenu affiché tel quel (pas de scroll
            interne). Si vraiment trop d'items, ça déborde — rare en pratique. */}
        {replies.length > 0 && (
          <div className="space-y-3">
            <SectionHeading>
              Conversation · {replies.length} réponse
              {replies.length > 1 ? "s" : ""}
            </SectionHeading>
            <ul className="space-y-3">
              {replies.map((reply) => (
                <li key={reply.id} className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {reply.agents && (
                      <span className="font-medium text-foreground">
                        {reply.agents.first_name} {reply.agents.last_name}
                      </span>
                    )}
                    {reply.agents && <span aria-hidden> · </span>}
                    <span className="tabular-nums">
                      {formatDateShort(reply.created_at)}
                    </span>
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {reply.message}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ContactReplyForm contactId={contact.id} />

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <DeleteContactButton
            id={contact.id}
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
