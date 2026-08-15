"use client";

import * as React from "react";
import { useId } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Agent, Post } from "@repo/shared/supabase/types";

import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

import { PostForm } from "@/components/post-form";
import { createPost, updatePost } from "@/lib/actions/posts";

/**
 * Dialog réutilisable pour création (`post` absent) et édition (`post`
 * fourni) d'un article. Les `children` deviennent le trigger cliquable.
 * L'URL de la liste reçoit `?preview=<id|new>` pour pouvoir partager un
 * lien profond vers un article en cours d'édition.
 *
 * Mise en page : Dialog borné en hauteur, le PostForm scrolle seul
 * (pattern Linear) et les actions restent fixées en bas dans le footer.
 */
export function BlogFormDialog({
  post,
  agents,
  children,
}: {
  post?: Post;
  agents: Agent[];
  /**
   * Élément cliquable qui déclenche le Dialog. Il devient le trigger —
   * base-ui lui injecte les handlers d'ouverture. Passer un <Button /> ou
   * un <button> stylisé (ex. carte de la table) ; pas de div non cliquable.
   */
  children: React.ReactElement;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formId = useId();

  const target = post?.id ?? "new";
  const open = searchParams.get("preview") === target;

  function handleOpenChange(next: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("preview", target);
    else if (params.get("preview") === target) params.delete("preview");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const action = post ? updatePost.bind(null, post.id) : createPost;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />
      <DialogContent
        style={{
          maxWidth: "min(40rem, calc(100vw - 2rem))",
          maxHeight: "min(85vh, 48rem)",
        }}
        className="flex flex-col overflow-hidden p-0"
      >
        <DialogHeader className="space-y-1 border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {post ? "Modifier l'article" : "Nouvel article"}
          </DialogTitle>
          <DialogDescription>
            {post
              ? "Mettez à jour le contenu puis enregistrez vos changements."
              : "Rédigez un nouvel article pour le Journal."}
          </DialogDescription>
        </DialogHeader>

        {/* Zone scrollable : seul le formulaire scrolle, pas le Dialog. */}
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <PostForm
            post={post}
            agents={agents}
            action={action}
            formId={formId}
            onCancel={() => handleOpenChange(false)}
            hideActions
          />
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-b-xl px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Annuler
          </Button>
          <Button type="submit" form={formId}>
            {post ? "Enregistrer" : "Créer l'article"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
