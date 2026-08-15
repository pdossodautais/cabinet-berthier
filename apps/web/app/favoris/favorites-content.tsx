"use client";

import { useEffect, useState } from "react";
import { createClient } from "@repo/shared/supabase/client";
import { PropertyCardMagazine } from "@/components/property-card-magazine";
import { Reveal } from "@/components/reveal";
import { useFavorites } from "@/lib/use-favorites";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";

export function FavoritesContent() {
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState<PropertyWithMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (favorites.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("*, property_media(id, url, position, alt_text, property_id)")
        .eq("is_published", true)
        .in("id", favorites);
      setProperties((data as PropertyWithMedia[]) || []);
      setLoading(false);
    }
    load();
  }, [favorites]);

  if (loading) {
    return (
      <div className="py-16">
        <div
          className="h-eyebrow"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          Chargement de votre sélection…
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Reveal kind="slide-up">
        <div
          className="py-24 text-center group"
          style={{ border: "1px solid var(--bone-raw)" }}
        >
          <Heart
            className="icon-scale h-10 w-10 mx-auto mb-6"
            strokeWidth={1.5}
            style={{ color: "var(--cobalt)" }}
          />
          <div className="chapter-mark mb-4 justify-center inline-flex animate-eyebrow-in">
            Aucun favori
          </div>
          <h2
            className="h-display mb-4"
            style={{ fontSize: "clamp(32px, 4.5vw, 52px)" }}
          >
            Aucun favori{" "}
            <em className="h-italic" style={{ color: "var(--cobalt)" }}>
              pour l&apos;instant.
            </em>
          </h2>
          <p
            className="text-[15px] max-w-md mx-auto mb-8"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 70%, transparent)",
            }}
          >
            Explorez le catalogue et ajoutez aux favoris les biens qui vous
            intéressent, en cliquant sur le cœur.
          </p>
          <Link href="/biens" className="btn-cobalt btn-fill">
            <span className="relative z-[1] inline-flex items-center gap-2">
              Voir le catalogue
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </Link>
        </div>
      </Reveal>
    );
  }

  return (
    <>
      <Reveal kind="slide-up">
        <div className="flex items-baseline justify-between mb-8 pt-8 rule-ink flex-wrap gap-4">
          <div
            className="h-eyebrow"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
            }}
          >
            <span className="tabular" style={{ color: "var(--cobalt)" }}>
              {String(properties.length).padStart(2, "0")}
            </span>{" "}
            bien{properties.length > 1 ? "s" : ""} en favori
            {properties.length > 1 ? "s" : ""}
          </div>
          <div
            className="h-eyebrow inline-flex items-center gap-2"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
            }}
          >
            <span
              className="animate-pulse-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--cobalt)" }}
            />
            Synchronisé · ce navigateur
          </div>
        </div>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {properties.map((property, i) => (
          <Reveal key={property.id} kind="scale" delay={Math.min(i, 5) * 80}>
            <PropertyCardMagazine
              property={property}
              index={i}
            />
          </Reveal>
        ))}
      </div>
    </>
  );
}
