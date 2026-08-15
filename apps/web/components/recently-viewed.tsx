"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/lib/use-recently-viewed";
import { createClient } from "@repo/shared/supabase/client";
import { formatPrice } from "@repo/shared/utils";
import { PropertyImage } from "@repo/ui/property-image";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";
import { PropertyImagePlaceholder } from "./property-image-placeholder";
import { Reveal } from "./reveal";

const MAX_DISPLAY = 6;

export function RecentlyViewed() {
  const { recentSlugs } = useRecentlyViewed();
  const [properties, setProperties] = useState<PropertyWithMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recentSlugs.length < 2) {
      setLoading(false);
      return;
    }

    const slugsToFetch = recentSlugs.slice(0, MAX_DISPLAY);
    let cancelled = false;

    async function fetchProperties() {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("*, property_media(*)")
        .in("slug", slugsToFetch)
        .eq("is_published", true);

      if (cancelled) return;

      if (data) {
        const sorted = slugsToFetch
          .map((slug) => data.find((p) => p.slug === slug))
          .filter(Boolean) as PropertyWithMedia[];
        setProperties(sorted);
      }
      setLoading(false);
    }

    fetchProperties();
    return () => {
      cancelled = true;
    };
  }, [recentSlugs]);

  if (!loading && (recentSlugs.length < 2 || properties.length < 2)) {
    return null;
  }

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-10 py-24">
      <Reveal kind="slide-up">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="chapter-mark mb-6 animate-eyebrow-in">Nº 03 — Votre sillage</div>
            <h2
              className="h-display"
              style={{ fontSize: "clamp(34px, 4.4vw, 60px)", lineHeight: 1.04 }}
            >
              Biens que vous{" "}
              <em className="h-italic" style={{ color: "var(--cobalt)" }}>
                avez consultés.
              </em>
            </h2>
          </div>
          <Link href="/biens" className="group link-under transition-colors hover:text-[color:var(--cobalt)] inline-flex items-center gap-2">
            Reprendre la recherche
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
          </Link>
        </div>
      </Reveal>

      <Reveal kind="slide-up" delay={120} duration={800}>
        <div
          className="flex gap-8 overflow-x-auto pb-4 -mb-4 scrollbar-none"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="min-w-[280px] max-w-[280px] shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Skeleton className="aspect-[4/5] w-full !rounded-none" />
                  <Skeleton className="h-3 w-16 mt-4 !rounded-none" />
                  <Skeleton className="h-5 w-full mt-3 !rounded-none" />
                  <Skeleton className="h-4 w-2/3 mt-2 !rounded-none" />
                </div>
              ))
            : properties.map((property, i) => {
                const firstImage = property.property_media?.sort(
                  (a, b) => a.position - b.position,
                )[0]?.url;
                const isRent = property.transaction_type === "location";

                return (
                  <div
                    key={property.id}
                    className="min-w-[280px] max-w-[280px] shrink-0"
                  >
                    <Link
                      href={`/biens/${property.slug}`}
                      className="group block card-lift"
                      style={{ scrollSnapAlign: "start" }}
                    >
                    <div
                      className="img-overlay-cobalt relative overflow-hidden"
                      style={{
                        aspectRatio: "4 / 5",
                        background: "var(--ivory-raw)",
                      }}
                    >
                      {firstImage ? (
                        <PropertyImage
                          src={firstImage}
                          alt={property.title}
                          fill
                          sizes="280px"
                          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                        />
                      ) : (
                        <PropertyImagePlaceholder variant="compact" />
                      )}
                      <div
                        className="absolute top-3 left-3 mono text-[10px] tracking-[0.22em] uppercase px-2 py-1 z-10"
                        style={{
                          background: "var(--paper-raw)",
                          color: "var(--ink-raw)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")} / {String(properties.length).padStart(2, "0")}
                      </div>
                    </div>

                    <div
                      className="mt-4 mono text-[10px] tracking-[0.22em] uppercase"
                      style={{ color: "var(--cobalt)" }}
                    >
                      {property.city || (isRent ? "Location" : "Vente")}
                    </div>
                    <h3
                      className="h-display mt-2 group-hover:text-[color:var(--cobalt)] transition-colors"
                      style={{
                        fontSize: 22,
                        lineHeight: 1.12,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      <span className="link-underline-anim">{property.title}</span>
                    </h3>
                    <div className="mt-3 pt-3 rule flex items-baseline justify-between">
                      <div
                        className="h-display tabular"
                        style={{
                          fontSize: 17,
                          color: "var(--ink-raw)",
                        }}
                      >
                        {formatPrice(property.price)}
                        {isRent && (
                          <span
                            className="ml-1 mono text-[10px] tracking-[0.18em] uppercase"
                            style={{
                              color:
                                "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                            }}
                          >
                            /mois
                          </span>
                        )}
                      </div>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.5}
                        style={{ color: "var(--cobalt)" }}
                      />
                    </div>
                    </Link>
                  </div>
                );
              })}
        </div>
      </Reveal>
    </section>
  );
}
