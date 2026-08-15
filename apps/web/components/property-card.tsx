import Link from "next/link";
import {
  formatPrice,
  formatSurface,
  getPropertyTypeLabel,
} from "@repo/shared/utils";
import { Bed, Bath, Maximize } from "lucide-react";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";
import { Card, CardContent, CardFooter } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { FavoriteButton } from "./favorite-button";
import { PropertyCardCarousel } from "./property-card-carousel";

export function PropertyCard({
  property,
  priority = false,
}: {
  property: PropertyWithMedia;
  priority?: boolean;
}) {
  const isSold = Boolean(property.sold_at);
  const soldLabel = property.transaction_type === "location" ? "Loué" : "Vendu";
  const locLabel = [
    property.city,
    property.postal_code && `${property.postal_code}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/biens/${property.slug}`}
      aria-label={`${property.title} — ${formatPrice(property.price)}${isSold ? ` (${soldLabel})` : ""}`}
      className="group block"
    >
      <Card className="overflow-hidden py-0 gap-0 shadow-none">
        <div className="aspect-[4/3] relative bg-muted overflow-hidden">
          <div className={isSold ? "opacity-70 grayscale-[35%]" : undefined}>
            <PropertyCardCarousel
              media={property.property_media || []}
              alt={property.title}
              priority={priority}
            />
          </div>

          {isSold ? (
            <div
              className="absolute top-3 left-3 z-30 pointer-events-none px-2 py-1 mono text-[10px] tracking-[0.22em] uppercase"
              style={{ background: "oklch(0.45 0.18 25)", color: "white" }}
            >
              {soldLabel}
            </div>
          ) : property.is_featured && (
            <div
              className="absolute top-3 left-3 z-30 pointer-events-none px-2 py-1 mono text-[10px] tracking-[0.22em] uppercase"
              style={{ background: "var(--cobalt)", color: "white" }}
            >
              Exclusivité
            </div>
          )}

          <div className="absolute top-3 right-3 z-30">
            <FavoriteButton propertyId={property.id} />
          </div>

          <div
            className="absolute bottom-3 right-3 z-30 pointer-events-none px-2 py-1 mono text-[10px] tracking-[0.22em] uppercase"
            style={{ background: "var(--ink-raw)", color: "var(--paper-raw)" }}
          >
            {property.transaction_type === "vente" ? "Vente" : "Location"}
          </div>
        </div>

        <CardContent className="pt-5 pb-4">
          <p className="text-xs text-muted-foreground">{locLabel}</p>
          <h3 className="text-base font-medium mt-1.5 line-clamp-2">
            {property.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {getPropertyTypeLabel(property.type)}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
            <span className="flex items-center gap-1.5">
              <Maximize className="h-3.5 w-3.5" />
              {formatSurface(property.surface)}
            </span>
            {property.rooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5" />
                {property.rooms} p.
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5" />
                {property.bathrooms}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t py-3 px-6 bg-muted/30">
          <p className="text-base font-semibold">
            {formatPrice(property.price)}
            {property.transaction_type === "location" && (
              <span className="text-xs text-muted-foreground font-normal ml-1">
                /mois
              </span>
            )}
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardContent className="pt-5 pb-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
      </CardContent>
      <CardFooter className="border-t py-3 px-6">
        <Skeleton className="h-5 w-20" />
      </CardFooter>
    </Card>
  );
}
