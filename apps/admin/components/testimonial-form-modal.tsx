"use client";

import { useState } from "react";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/actions/testimonials";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@repo/shared/supabase/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Checkbox } from "@repo/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  AlertDialogTrigger,
} from "@repo/ui/alert-dialog";
import { Plus, Pencil, Star } from "lucide-react";
import { toast } from "sonner";

export function TestimonialFormModal({
  testimonial,
  children,
}: {
  testimonial?: Testimonial;
  /** Custom trigger element. Si fourni, remplace le bouton "Modifier" / "Ajouter" par défaut. */
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    formData.set("rating", String(rating));
    const result = testimonial
      ? await updateTestimonial(testimonial.id, formData)
      : await createTestimonial(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!testimonial) return;
    await deleteTestimonial(testimonial.id);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setRating(testimonial?.rating ?? 5); }}>
      {children ? (
        <DialogTrigger
          render={
            <button
              type="button"
              className="block w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
              aria-label={
                testimonial
                  ? `Modifier le témoignage de ${testimonial.name}`
                  : "Nouveau témoignage"
              }
            />
          }
        >
          {children}
        </DialogTrigger>
      ) : testimonial ? (
        <DialogTrigger render={<Button variant="ghost" size="sm" />}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Modifier
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un témoignage
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? "Modifier le témoignage" : "Nouveau témoignage"}
          </DialogTitle>
          <DialogDescription>
            {testimonial
              ? "Modifiez les informations du témoignage."
              : "Ajoutez un nouveau témoignage client."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              name="name"
              id="name"
              required
              defaultValue={testimonial?.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Input
              name="role"
              id="role"
              placeholder="Acheteur, Vendeur, Locataire..."
              defaultValue={testimonial?.role || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Témoignage *</Label>
            <Textarea
              name="content"
              id="content"
              rows={4}
              required
              defaultValue={testimonial?.content}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Lien (URL)</Label>
            <Input
              name="url"
              id="url"
              type="url"
              placeholder="https://g.co/kgs/..."
              defaultValue={testimonial?.url || ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Note</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="p-0.5 hover:scale-110 transition-transform"
                  aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_published"
              name="is_published"
              defaultChecked={testimonial?.is_published ?? true}
            />
            <Label htmlFor="is_published" className="font-normal">
              Publié (visible sur le site)
            </Label>
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            {testimonial && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button type="button" variant="destructive" size="sm" />
                  }
                >
                  Supprimer
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Supprimer ce témoignage ?
                    </AlertDialogTitle>
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
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {testimonial ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
