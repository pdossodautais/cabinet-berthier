"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getPropertyTypeLabel,
  getTransactionTypeLabel,
} from "@repo/shared/utils";

import { Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";

import { toggleAlertActive, deleteAlert } from "@/lib/actions/alerts";

export type AlertDetailRow = {
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
};

export type NotifiedProperty = {
  id: string;
  title: string;
  slug: string;
  price: number;
  city: string;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function MetaRow({
  label,
  children,
  dim,
}: {
  label: string;
  children: React.ReactNode;
  /** Valeur non renseignée ? Grise le libellé pour que les critères
   *  effectifs ressortent visuellement dans la liste. */
  dim?: boolean;
}) {
  return (
    <div className="flex gap-3 text-sm">
      <dt
        className={`w-28 shrink-0 ${dim ? "text-muted-foreground/60" : "text-muted-foreground"}`}
      >
        {label}
      </dt>
      <dd
        className={`min-w-0 flex-1 ${dim ? "text-muted-foreground/60" : ""}`}
      >
        {children}
      </dd>
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

/**
 * Détail complet d'une alerte — tous les critères posés par l'abonné,
 * le statut, la date, et l'historique des biens pour lesquels un email
 * lui a déjà été envoyé (dédup côté notify-alerts).
 *
 * Wrapped autour d'un élément déclencheur (par défaut la cellule email
 * de la table) via `children`, à l'image de ContactDetailDialog :
 * l'état `open` est synchronisé via `?preview=<alertId>` pour permettre
 * le lien profond depuis une autre page admin.
 */
export function AlertDetailDialog({
  alert,
  notifiedProperties,
  children,
}: {
  alert: AlertDetailRow;
  notifiedProperties: NotifiedProperty[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const open = searchParams.get("preview") === alert.id;

  function handleOpenChange(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("preview", alert.id);
    else if (params.get("preview") === alert.id) params.delete("preview");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  async function handleToggle() {
    const result = await toggleAlertActive(alert.id, !alert.is_active);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        alert.is_active ? "Alerte désactivée." : "Alerte réactivée.",
      );
      router.refresh();
    }
  }

  async function handleDelete() {
    const result = await deleteAlert(alert.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Alerte supprimée.");
      handleOpenChange(false);
      router.refresh();
    }
  }

  const hasTransaction = !!alert.transaction_type;
  const hasPropertyType = !!alert.property_type;
  const hasCity = !!alert.city;
  const hasPrice = alert.prix_max != null;
  const hasSurface = alert.surface_min != null;
  const hasRooms = alert.rooms != null;

  const activeCriteriaCount = [
    hasTransaction,
    hasPropertyType,
    hasCity,
    hasPrice,
    hasSurface,
    hasRooms,
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="block w-full cursor-pointer rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Voir le détail de l'alerte de ${alert.email}`}
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
            <a
              href={`mailto:${alert.email}`}
              className="hover:underline"
            >
              {alert.email}
            </a>
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Créée le {formatDate(alert.created_at)}</span>
            <span aria-hidden>·</span>
            {alert.is_active ? (
              <Badge>Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
            <span aria-hidden>·</span>
            <span>
              {activeCriteriaCount} critère{activeCriteriaCount > 1 ? "s" : ""}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <SectionHeading>Critères de recherche</SectionHeading>
          <dl className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <MetaRow label="Transaction" dim={!hasTransaction}>
              {hasTransaction ? (
                <Badge variant="outline" className="font-normal">
                  {getTransactionTypeLabel(alert.transaction_type!)}
                </Badge>
              ) : (
                "Indifférent"
              )}
            </MetaRow>
            <MetaRow label="Type de bien" dim={!hasPropertyType}>
              {hasPropertyType
                ? getPropertyTypeLabel(alert.property_type!)
                : "Indifférent"}
            </MetaRow>
            <MetaRow label="Ville" dim={!hasCity}>
              {hasCity ? alert.city : "Indifférente"}
            </MetaRow>
            <MetaRow label="Prix max" dim={!hasPrice}>
              <span className="tabular-nums">{formatPrice(alert.prix_max)}</span>
            </MetaRow>
            <MetaRow label="Surface min" dim={!hasSurface}>
              <span className="tabular-nums">
                {hasSurface ? `${alert.surface_min} m²` : "—"}
              </span>
            </MetaRow>
            <MetaRow label="Pièces (min)" dim={!hasRooms}>
              <span className="tabular-nums">
                {hasRooms
                  ? `${alert.rooms}${alert.rooms! > 1 ? "+" : ""}`
                  : "—"}
              </span>
            </MetaRow>
          </dl>
          {activeCriteriaCount === 0 && (
            <p className="text-xs text-muted-foreground">
              Aucun critère posé — l&apos;abonné reçoit un email pour chaque
              nouveau bien publié.
            </p>
          )}
        </div>

        {/* Historique des notifications : CONTENU SEUL scrollable, titre fixe. */}
        <div className="flex min-h-0 flex-1 flex-col space-y-2">
          <SectionHeading>
            Biens notifiés · {notifiedProperties.length}
          </SectionHeading>
          {notifiedProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun email d&apos;alerte n&apos;a encore été envoyé pour cette
              recherche.
            </p>
          ) : (
            <ul className="scrollbar-thin min-h-0 flex-1 space-y-1.5 overflow-y-auto">
              {notifiedProperties.map((p) => (
                <li
                  key={p.id}
                  className="flex items-baseline justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <Link
                    href={`/biens/${p.id}`}
                    className="min-w-0 flex-1 truncate font-medium hover:underline"
                  >
                    {p.title}
                  </Link>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {p.city} · {formatPrice(p.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggle}
            >
              <Power className="mr-1.5 size-3.5" />
              {alert.is_active ? "Désactiver" : "Réactiver"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Supprimer
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette alerte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;abonné ne recevra plus
              aucun email pour cette recherche.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
