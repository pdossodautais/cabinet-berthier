"use client";

import { ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@repo/ui/sheet";
import { ContactForm } from "./contact-form";

interface Props {
  propertyId: string;
  /** Titre du bien injecté dans le header du drawer pour rassurer
   *  l'utilisateur sur le contexte avant de remplir le formulaire. */
  propertyTitle: string;
  /** Référence (ex. AG-1234) affichée dans le header. */
  propertyRef: string;
  /** Étiquette du bouton déclencheur — « Nous contacter » par défaut
   *  (intentionnellement générique : visiter, poser une question,
   *  négocier, etc. sont tous des raisons valables d'écrire). */
  label?: string;
  /** Variant du bouton : dark (bg-ink) par défaut, outline si utilisé
   *  comme secondaire. */
  variant?: "dark" | "outline";
  /** Classe CSS custom — utile pour matcher la largeur du conteneur
   *  (ex. `w-full` dans une carte). */
  className?: string;
}

/**
 * Drawer de contact pour une fiche bien. Ouverture slide-in depuis la
 * droite (Sheet Base UI), backdrop légèrement flouté, fermeture via
 * overlay ou bouton X.
 *
 * Le ContactForm à l'intérieur reçoit le `propertyId` en prop → la
 * server action `submitContactForm` lie automatiquement le message au
 * bien concerné côté Supabase.
 */
export function VisitRequestDrawer({
  propertyId,
  propertyTitle,
  propertyRef,
  label = "Nous contacter",
  variant = "dark",
  className = "",
}: Props) {
  const triggerCls =
    variant === "dark"
      ? "inline-flex items-center justify-center gap-2 h-11 px-4 bg-primary text-primary-foreground text-[13px] font-medium tracking-[0.02em] hover:bg-primary/90 transition-colors"
      : "inline-flex items-center justify-center gap-2 h-11 px-4 border border-border text-foreground text-[13px] hover:border-primary transition-colors";

  return (
    <Sheet>
      <SheetTrigger
        render={<button type="button" className={`${triggerCls} ${className}`} />}
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.3} />
      </SheetTrigger>

      <SheetContent
        side="right"
        // Largeur confortable pour un formulaire de contact (cap à 32rem
        // en md+), hauteur 100vh par défaut. Scroll interne géré par le
        // contenu si besoin. Le fond `paper` s'aligne sur la charte
        // du site. `!gap-0` neutralise le `gap-4` du Sheet
        // par défaut — sinon une bande de 16px apparaît entre le
        // header et le form.
        className="!w-full !sm:max-w-md bg-background p-0 !gap-0 flex flex-col overflow-hidden"
      >
        {/* Header : titre + rappel du bien */}
        <div className="px-7 py-8 border-b border-border">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Nous contacter</span>
          <h2 className="text-[24px] font-semibold tracking-tight mt-3 text-foreground">
            Ce bien vous intéresse ?
          </h2>
          <p className="text-[12px] text-muted-foreground mt-4 leading-[1.6]">
            Référence <span className="font-mono text-foreground">{propertyRef}</span> —{" "}
            <span className="text-foreground">{propertyTitle}</span>. Nous
            revenons vers vous dans la journée.
          </p>
        </div>

        {/* Form scrollable — message pré-rempli avec la réf du bien pour
            rendre la demande immédiatement contextuelle. L'utilisateur
            peut tout réécrire, c'est juste un point de départ. */}
        <div className="scrollbar-editorial flex-1 overflow-y-auto px-7 py-7">
          <ContactForm
            propertyId={propertyId}
            defaultMessage={`Bonjour, je suis intéressé(e) par le bien « ${propertyTitle} ». Pourriez-vous me recontacter ?`}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
