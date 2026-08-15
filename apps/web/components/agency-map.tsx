"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

const TILE_STYLE = "https://tiles.openfreemap.org/styles/bright";

const HOUSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function AgencyMap({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  address: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      if (!mapRef.current || instanceRef.current) return;

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: TILE_STYLE,
        center: [longitude, latitude],
        zoom: 15.5,
        doubleClickZoom: false,
        attributionControl: {},
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        bearing: 0,
        pitch: 0,
        maxPitch: 0,
        cooperativeGestures:
          typeof window !== "undefined" &&
          window.matchMedia("(hover: none), (pointer: coarse)").matches,
        locale: {
          "CooperativeGesturesHandler.MobileHelpText":
            "Utilisez deux doigts pour déplacer la carte",
          "CooperativeGesturesHandler.WindowsHelpText":
            "Utilisez Ctrl + molette pour zoomer",
          "CooperativeGesturesHandler.MacHelpText":
            "Utilisez ⌘ + molette pour zoomer",
        },
      });
      map.touchZoomRotate.disableRotation();

      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
          visualizePitch: false,
        }),
        "top-right",
      );

      map.on("styleimagemissing", ({ id }) => {
        if (!map.hasImage(id))
          map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
      });

      const el = document.createElement("div");
      el.innerHTML = `
        <div class="map-property-marker is-expanded">
          <span class="map-property-icon">${HOUSE_SVG}</span>
          <span class="map-property-label">${escapeHtml(address)}</span>
        </div>`;
      const marker = el.querySelector(".map-property-marker") as HTMLElement;
      el.addEventListener("click", () => marker.classList.toggle("is-expanded"));

      new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([longitude, latitude])
        .addTo(map);

      instanceRef.current = map;
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [latitude, longitude, address]);

  return (
    <div
      ref={mapRef}
      role="region"
      aria-label={`Carte — ${address}`}
      className="h-full w-full"
    />
  );
}
