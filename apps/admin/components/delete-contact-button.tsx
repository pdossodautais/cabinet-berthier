"use client";

import { deleteContact } from "@/lib/actions/contacts";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteContactButton({
  id,
  redirectAfter = true,
  renderAsMenuItem = false,
  variant = "icon",
}: {
  id: string;
  /** Redirige vers /contacts après suppression (utile depuis le détail). */
  redirectAfter?: boolean;
  /**
   * Si true, rend un trigger « menu item » plein largeur rouge (pour usage
   * dans un DropdownMenu). Sinon, rend un icon-button.
   */
  renderAsMenuItem?: boolean;
  /**
   * Forme du bouton quand `renderAsMenuItem` est false :
   * - `icon` (défaut) : bouton icône ghost discret
   * - `destructive` : bouton plein variant destructive avec libellé
   */
  variant?: "icon" | "destructive";
}) {
  const router = useRouter();

  async function handleDelete() {
    const result = await deleteContact(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Contact supprimé.");
    if (redirectAfter) {
      router.push("/contacts");
    } else {
      router.refresh();
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          renderAsMenuItem ? (
            <button
              type="button"
              className="focus:bg-accent focus:text-destructive relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive outline-hidden select-none hover:bg-accent"
            />
          ) : variant === "destructive" ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              aria-label="Supprimer ce contact"
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label="Supprimer ce contact"
            />
          )
        }
      >
        {renderAsMenuItem ? (
          <>
            <Trash2 className="size-4" />
            Supprimer
          </>
        ) : variant === "destructive" ? (
          <>
            <Trash2 className="size-3.5" />
            Supprimer
          </>
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce contact ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible.
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
  );
}
