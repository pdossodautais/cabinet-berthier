"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { List as ListIcon, Map as MapIcon } from "lucide-react";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";
import type { MapProperty } from "@/lib/data";
import { MapSearch, type MapBounds } from "./map-search";
import { FavoriteButton } from "./favorite-button";
import {
  formatPriceShort,
  formatSurface,
  getPropertyTypeLabel,
} from "@repo/shared/utils";

function useAppModeLock() {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    body.classList.add("is-app-mode");
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    // Cache l'announcement bar en mode carte pour gagner 36px de hauteur utile
    // (elle n'a pas de sens dans cette vue).
    const announcement = document.querySelector<HTMLElement>(
      "[data-announcement-bar]",
    );
    const prevDisplay = announcement?.style.display ?? "";
    if (announcement) announcement.style.display = "none";

    return () => {
      body.classList.remove("is-app-mode");
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      if (announcement) announcement.style.display = prevDisplay;
    };
  }, []);
}

type Props = {
  properties: PropertyWithMedia[];
  mapProperties: MapProperty[];
};

type MobileView = "map" | "list";

export function MapSplitView({ properties, mapProperties }: Props) {
  useAppModeLock();
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("map");

  const handleBoundsChange = useCallback((b: MapBounds) => {
    setBounds(b);
  }, []);

  const visibleProperties = useMemo(() => {
    if (!bounds) return properties;
    return properties.filter((p) => {
      if (p.latitude == null || p.longitude == null) return false;
      return (
        p.latitude >= bounds.south &&
        p.latitude <= bounds.north &&
        p.longitude >= bounds.west &&
        p.longitude <= bounds.east
      );
    });
  }, [properties, bounds]);

  const listContent = (
    <>
      <div
        className="px-6 py-5 sticky top-0 z-10"
        style={{
          background: "var(--paper-raw)",
          borderBottom: "1px solid var(--bone-raw)",
        }}
      >
        <div className="h-eyebrow" style={{ color: "var(--cobalt)" }}>
          ¶ {visibleProperties.length} bien
          {visibleProperties.length > 1 ? "s" : ""} dans cette zone
        </div>
        <div
          className="mono text-[10px] tracking-[0.16em] uppercase mt-1"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
          }}
        >
          Déplacez la carte pour affiner la zone
        </div>
      </div>

      {visibleProperties.length === 0 ? (
        <div className="p-8 text-[14px]" style={{ color: "var(--ink-raw)" }}>
          Aucun bien visible dans cette zone. Dézoomez ou déplacez la carte.
        </div>
      ) : (
        <ul>
          {visibleProperties.map((p, i) => (
            <li
              key={p.id}
              style={{
                borderBottom:
                  i === visibleProperties.length - 1
                    ? "none"
                    : "1px solid var(--bone-raw)",
              }}
            >
              <MapPropertyRow property={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <div className="relative h-full flex flex-col lg:flex-row">
      {/* Liste — desktop : colonne gauche fixe / mobile : plein écran si mobileView === "list" */}
      <aside
        className={
          "shrink-0 overflow-y-auto scrollbar-editorial lg:block lg:w-[440px] xl:w-[500px] " +
          (mobileView === "list" ? "block w-full flex-1" : "hidden")
        }
        style={{
          background: "var(--paper-raw)",
          borderRight: "1px solid var(--bone-raw)",
        }}
        aria-hidden={mobileView !== "list"}
      >
        {listContent}
      </aside>

      {/* Carte — desktop : flex-1 à droite / mobile : plein écran si mobileView === "map" */}
      <div
        className={
          "relative lg:flex-1 lg:block " +
          (mobileView === "map" ? "flex-1 block" : "hidden")
        }
        aria-hidden={mobileView !== "map"}
      >
        <MapSearch
          properties={mapProperties}
          onBoundsChange={handleBoundsChange}
        />
      </div>

    </div>
  );
}

function MapPropertyRow({ property }: { property: PropertyWithMedia }) {
  const media = (property.property_media ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  const cover = media[0]?.url ?? null;
  const typeLabel = getPropertyTypeLabel(property.type);
  const isRent = property.transaction_type === "location";

  return (
    <Link
      href={`/biens/${property.slug}`}
      className="group flex gap-4 p-5 transition-colors hover:bg-[color:var(--ivory-raw)]"
    >
      <div
        className="relative shrink-0 w-[128px] h-[96px] overflow-hidden"
        style={{ background: "var(--bone-raw)" }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            sizes="128px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="placeholder-photo w-full h-full" />
        )}
        <div
          className="absolute top-1.5 left-1.5 px-1.5 py-0.5 mono text-[9px] uppercase tracking-[0.14em]"
          style={{
            background: "var(--cobalt)",
            color: "white",
          }}
        >
          {typeLabel}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div
            className="mono text-[10px] tracking-[0.16em] uppercase"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
            }}
          >
            {property.postal_code || property.city}
          </div>
          <div
            className="h-display text-[17px] leading-[1.1] mt-1 line-clamp-2"
            style={{ color: "var(--ink-raw)" }}
          >
            {property.title}
          </div>
        </div>
        <div className="flex items-end justify-between gap-3 mt-2">
          <div
            className="mono text-[11px] tabular"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
            }}
          >
            {formatSurface(property.surface)} · {property.rooms}p
          </div>
          <div
            className="h-display tabular text-[18px] leading-none"
            style={{ color: "var(--cobalt)" }}
          >
            {formatPriceShort(property.price)}
            {isRent && (
              <span
                className="mono text-[9px] ml-1 tracking-[0.12em]"
                style={{
                  color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
                }}
              >
                /mois
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="shrink-0 self-start"
        onClick={(e) => e.stopPropagation()}
      >
        <FavoriteButton propertyId={property.id} />
      </div>
    </Link>
  );
}
