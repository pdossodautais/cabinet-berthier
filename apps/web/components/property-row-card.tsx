import Link from "next/link";
import {
  formatPrice,
  formatSurface,
  getPropertyTypeLabel,
} from "@repo/shared/utils";
import { Bed, Bath, Maximize, ArrowUpRight } from "lucide-react";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";
import { Card } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { FavoriteButton } from "./favorite-button";
import { PropertyCardCarousel } from "./property-card-carousel";

export function PropertyRowCard({
  property,
  priority = false,
}: {
  property: PropertyWithMedia;
  priority?: boolean;
}) {
  const isSold = Boolean(property.sold_at);
  const soldLabel = property.transaction_type === "location" ? "Loué" : "Vendu";
  const locLabel = [property.city, property.postal_code]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/biens/${property.slug}`}
      aria-label={`${property.title} — ${formatPrice(property.price)}${isSold ? ` (${soldLabel})` : ""}`}
      className="group block"
    >
      <Card className="overflow-hidden p-0 gap-0 shadow-none relative">
        <ArrowUpRight
          aria-hidden="true"
          className="absolute top-6 right-6 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
        />

        <article className="flex flex-col md:flex-row">
          <div className="md:w-[320px] lg:w-[360px] shrink-0 aspect-[4/3] md:aspect-[3/2] relative bg-muted overflow-hidden">
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

          <div className="flex-1 min-w-0 p-6 md:p-8 flex flex-col">
            <p className="text-xs text-muted-foreground mb-1.5">{locLabel}</p>

            <h3 className="text-xl md:text-2xl font-medium leading-tight line-clamp-2">
              {property.title}
            </h3>

            <p className="text-xs text-muted-foreground mt-2">
              {getPropertyTypeLabel(property.type)}
              {property.address && <> · {property.address}</>}
            </p>

            {property.description && (
              <p className="text-sm text-muted-foreground mt-4 line-clamp-2 max-w-[640px]">
                {property.description}
              </p>
            )}

            <div className="flex items-center gap-5 text-sm text-muted-foreground mt-5 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Maximize className="h-3.5 w-3.5" />
                {formatSurface(property.surface)}
              </span>
              {property.rooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bed className="h-3.5 w-3.5" />
                  {property.rooms} pièce{property.rooms > 1 ? "s" : ""}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1.5">
                  <Bath className="h-3.5 w-3.5" />
                  {property.bathrooms}
                </span>
              )}
              {property.energy_rating && (
                <span className="text-xs">DPE {property.energy_rating}</span>
              )}
            </div>

            <div className="mt-auto pt-5 border-t flex items-baseline justify-between gap-4">
              <p className="text-2xl font-semibold">
                {formatPrice(property.price)}
                {property.transaction_type === "location" && (
                  <span className="text-sm text-muted-foreground font-normal ml-1">
                    /mois
                  </span>
                )}
              </p>
            </div>
          </div>
        </article>
      </Card>
    </Link>
  );
}

export function PropertyRowCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0 gap-0">
      <div className="flex flex-col md:flex-row">
        <Skeleton className="md:w-[320px] lg:w-[360px] shrink-0 aspect-[4/3] md:aspect-[3/2] w-full rounded-none" />
        <div className="flex-1 p-6 md:p-8 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-full mt-3" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex gap-5 pt-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex items-baseline justify-between pt-5 border-t mt-5">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );
}
