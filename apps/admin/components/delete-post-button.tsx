"use client";

import { deletePost } from "@/lib/actions/posts";
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
import { useRouter } from "next/navigation";

export function DeletePostButton({
  id,
  title,
  redirect: shouldRedirect,
  renderAsMenuItem = false,
}: {
  id: string;
  title: string;
  redirect?: boolean;
  /**
   * Si true, rend un trigger « menu item » plein largeur rouge (pour usage
   * dans un DropdownMenu / ContextMenu). Sinon, rend un icon-button.
   */
  renderAsMenuItem?: boolean;
}) {
  const router = useRouter();

  async function handleDelete() {
    const result = await deletePost(id);
    if (result?.error) {
      toast.error(result.error);
    } else if (shouldRedirect) {
      toast.success("Article supprime.");
      router.push("/blog");
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
              size={shouldRedirect ? "default" : "icon"}
              className="text-destructive hover:text-destructive"
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
          <>
            <Trash2 className="h-4 w-4" />
            {shouldRedirect && <span className="ml-2">Supprimer</span>}
          </>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet article ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous etes sur le point de supprimer &laquo; {title} &raquo;. Cette
            action est irreversible.
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
