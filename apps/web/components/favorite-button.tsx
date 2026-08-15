"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "@/lib/use-favorites";
import { cn } from "@repo/ui/utils";

export function FavoriteButton({
  propertyId,
  className,
}: {
  propertyId: string;
  className?: string;
}) {
  const { toggle, isFavorite } = useFavorites();
  const active = isFavorite(propertyId);
  const [pulseKey, setPulseKey] = useState(0);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
        // Re-mount le cœur pour relancer l'anim cv-pulseHeart à chaque clic.
        setPulseKey((k) => k + 1);
      }}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      className={cn(
        "h-11 w-11 inline-flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.06] active:scale-[0.92] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]",
        className,
      )}
      style={{
        background: active ? "var(--cobalt)" : "var(--paper-raw)",
        color: active ? "white" : "var(--ink-raw)",
      }}
    >
      <Heart
        key={pulseKey}
        className={cn("h-4 w-4 transition-colors duration-300", pulseKey > 0 && "animate-pulse-heart")}
        strokeWidth={1.5}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
