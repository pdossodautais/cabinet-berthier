"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
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

/**
 * Menu d'actions d'une ligne d'alerte — aligné sur le pattern
 * estimations/contacts : un seul bouton ⋯ en fin de ligne qui déroule
 * toutes les actions, plutôt que des contrôles éparpillés.
 *
 * - « Ouvrir le détail » déclenche le dialog via `?preview=<id>`
 * - Toggle actif/inactif sans confirmation (réversible d'un clic)
 * - Raccourci email (mailto)
 * - Suppression protégée par AlertDialog (irréversible)
 */
export function AlertActions({
  id,
  email,
  isActive,
}: {
  id: string;
  email: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  async function handleToggle() {
    const result = await toggleAlertActive(id, !isActive);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isActive ? "Alerte désactivée." : "Alerte réactivée.");
      router.refresh();
    }
  }

  async function handleDelete() {
    const result = await deleteAlert(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Alerte supprimée.");
      router.refresh();
    }
  }

  return (
    <>
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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            render={<Link href={`/alertes?preview=${id}`} scroll={false} />}
          >
            Ouvrir le détail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            {isActive ? "Désactiver" : "Réactiver"}
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href={`mailto:${email}`} />}>
            Envoyer un email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              setConfirmDelete(true);
            }}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AlertDialog contrôlé entièrement par `open` / `onOpenChange` —
          pas de Trigger (Base UI exige un <button> natif, et on déclenche
          depuis le DropdownMenuItem). */}
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
    </>
  );
}
