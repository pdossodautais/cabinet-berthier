"use client";

import type { Post, Agent } from "@repo/shared/supabase/types";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
} from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import { Button } from "@repo/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@repo/ui/select";
import { uploadPostCover } from "@/lib/actions/posts";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@repo/ui/utils";

interface PostFormProps {
  post?: Post;
  agents: Agent[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  /** ID du form — permet de le soumettre depuis un bouton externe (footer du Dialog). */
  formId?: string;
  /** Callback appelé quand l'utilisateur annule (Dialog onOpenChange(false)). */
  onCancel?: () => void;
  /** Masquer les boutons du form — utile si on les remonte dans le footer du Dialog. */
  hideActions?: boolean;
}

export function PostForm({
  post,
  agents,
  action,
  formId = "post-form",
  onCancel,
  hideActions = false,
}: PostFormProps) {
  const router = useRouter();
  const [coverUrl, setCoverUrl] = useState(post?.cover_url || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authorId, setAuthorId] = useState<string>(post?.author_id || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authorLabel = authorId
    ? (() => {
        const a = agents.find((x) => x.id === authorId);
        return a ? `${a.first_name} ${a.last_name}` : "Aucun";
      })()
    : "Aucun";

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const result = await uploadPostCover(fd);
    setUploading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.url) {
      setCoverUrl(result.url);
      toast.success("Image importée.");
    }
  }

  function handleRemoveCover() {
    setCoverUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    formData.set("cover_url", coverUrl);
    const result = await action(formData);
    setSubmitting(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(post ? "Article mis à jour." : "Article créé.");
    if (onCancel) {
      onCancel();
      router.refresh();
    } else {
      router.push("/blog");
    }
  }

  const submitLabel = submitting
    ? "Enregistrement…"
    : post
      ? "Enregistrer"
      : "Créer l'article";

  return (
    <form id={formId} action={handleSubmit} className="space-y-6">
      {/* Cover : preview cliquable pour changer, bouton Retirer si présente. */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Image de couverture</span>
          {coverUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveCover}
              disabled={uploading}
              className="h-7 px-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Retirer
            </Button>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label={coverUrl ? "Changer l'image de couverture" : "Ajouter une image de couverture"}
          className={cn(
            "group relative block w-full overflow-hidden rounded-lg border border-dashed border-input bg-muted/20 text-left transition-colors",
            "hover:border-ring hover:bg-muted/40 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            coverUrl ? "aspect-video" : "aspect-video sm:aspect-[3/1]",
          )}
        >
          {coverUrl ? (
            <>
              <Image
                src={coverUrl}
                alt="Couverture"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 640px"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/30">
                <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  Changer l'image
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-muted-foreground">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <span className="text-sm">
                {uploading ? "Import en cours…" : "Cliquez pour ajouter une image"}
              </span>
              <span className="text-xs">JPG, PNG ou WebP</span>
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          disabled={uploading}
          className="sr-only"
        />
        <input type="hidden" name="cover_url" value={coverUrl} />
      </div>

      <FieldSeparator />

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Titre</FieldLabel>
          <Input
            id="title"
            name="title"
            required
            defaultValue={post?.title}
            placeholder="Titre de l'article"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            name="slug"
            defaultValue={post?.slug}
            placeholder="mon-article"
          />
          <FieldDescription>Laissé vide = généré automatiquement depuis le titre.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="excerpt">Extrait</FieldLabel>
          <Textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt}
            placeholder="Court résumé de l'article…"
          />
          <FieldDescription>Affiché sur la liste du blog.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="content">Contenu</FieldLabel>
          <Textarea
            id="content"
            name="content"
            rows={12}
            defaultValue={post?.content}
            placeholder="Contenu complet de l'article…"
            className="font-mono text-sm leading-relaxed"
          />
          <FieldDescription>Markdown supporté.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="author_id">Auteur</FieldLabel>
          <Select
            name="author_id"
            value={authorId}
            onValueChange={(v) =>
              setAuthorId(!v || v === "__none__" ? "" : v)
            }
          >
            <SelectTrigger id="author_id" className="w-full">
              <span>{authorLabel}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Aucun</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.first_name} {agent.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="is_published"
            name="is_published"
            defaultChecked={post?.is_published}
          />
          <FieldLabel htmlFor="is_published" className="font-normal">
            Publier l'article
          </FieldLabel>
        </Field>
      </FieldGroup>

      {!hideActions && (
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={submitting || uploading}>
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
