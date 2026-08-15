"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

const TILE_STYLE = "https://tiles.openfreemap.org/styles/bright";

/**
 * Carte statique et minimaliste pour la fiche bien — juste la map + un pin
 * cobalt. Pas de recherche d'itinéraire, pas de modes de transport, pas de
 * destinations fréquentes. L'adresse s'affiche en overlay au parent.
 */
export function PropertyMapStatic({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("maplibre-gl").Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: TILE_STYLE,
        center: [longitude, latitude],
        zoom: 15,
        attributionControl: false,
        doubleClickZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchZoomRotate: false,
        interactive: false,
      });

      map.on("load", () => {
        // Marker personnalisé cobalt
        const el = document.createElement("div");
        el.style.width = "48px";
        el.style.height = "48px";
        el.style.borderRadius = "50%";
        el.style.background = "var(--cobalt)";
        el.style.boxShadow = "0 6px 20px rgba(22, 68, 168, 0.35)";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.cursor = "default";
        el.innerHTML =
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';

        new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map);
      });

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude]);

  return (
    <div
      ref={mapRef}
      className="absolute inset-0"
      aria-label="Carte de localisation"
      role="img"
    />
  );
}
