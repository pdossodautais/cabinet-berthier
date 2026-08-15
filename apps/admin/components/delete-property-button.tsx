"use client";

import * as React from "react";
import { deleteProperty } from "@/lib/actions/properties";
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

export function DeletePropertyButton({
  id,
  title,
  renderAsMenuItem = false,
}: {
  id: string;
  title: string;
  /**
   * Si true, rend un trigger « menu item » plein largeur rouge (pour usage
   * dans un DropdownMenu / ContextMenu). Sinon, rend un icon-button.
   */
  renderAsMenuItem?: boolean;
}) {
  async function handleDelete() {
    const result = await deleteProperty(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Bien supprimé.");
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
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              aria-label={`Supprimer ${title}`}
            />
          )
        }
      >
        {renderAsMenuItem ? (
          <>
            <Trash2 className="size-4" />
            Supprimer
          </>
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer «&nbsp;{title}&nbsp;». Cette
            action est irréversible.
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
