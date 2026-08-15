"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { formatPrice, formatSurface, formatPriceShort } from "@repo/shared/utils";
import type { MapProperty } from "@/lib/data";

// Style « Bright » d'OpenFreeMap — équivalent OSS du Mapbox Streets v12
// utilisé par SeLoger : fond crème, eau pastel, parcs verts, POI colorés.
const TILE_STYLE = "https://tiles.openfreemap.org/styles/bright";

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function MapSearch({
  properties,
  onBoundsChange,
}: {
  properties: MapProperty[];
  onBoundsChange?: (bounds: MapBounds) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const onBoundsChangeRef = useRef(onBoundsChange);
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: TILE_STYLE,
        center: [1.888334, 46.603354], // France center
        zoom: 6,
        doubleClickZoom: false,
        attributionControl: {},
        // Toujours vue classique nord en haut — pas de rotation ni pitch
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        bearing: 0,
        pitch: 0,
        maxPitch: 0,
        // Pas de cooperative gestures : les vues liste+carte et carte
        // plein écran sont dédiées à la navigation carte, pas d'enjeu
        // de scroll de page à protéger → molette zoome directement,
        // 1 doigt panne, 2 doigts pinchent.
      });
      map.touchZoomRotate.disableRotation();

      map.on("styleimagemissing", ({ id }) => {
        if (!map.hasImage(id)) map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
      });

      // Add markers for each property
      const bounds = new maplibregl.LngLatBounds();
      let hasMarkers = false;
      let activeMarker: HTMLElement | null = null;

      function collapseActive() {
        if (activeMarker) {
          activeMarker.classList.remove("is-expanded");
          const wrapper = activeMarker.parentElement;
          if (wrapper) wrapper.style.zIndex = "";
          activeMarker = null;
        }
      }

      map.on("click", () => collapseActive());

      for (const p of properties) {
        const images = p.image_urls.length > 0 ? p.image_urls : [];
        const total = images.length;
        const hasSlider = total > 1;
        // Piste qui glisse avec transform (même pattern que
        // property-card-carousel.tsx) plutôt que display:none sur chaque slide.
        const slidesHtml = total > 0
          ? images
              .map(
                (url, i) =>
                  `<div class="map-slide" data-index="${i}" style="width:${100 / total}%"><img src="${escapeHtml(url)}" alt="${escapeHtml(p.title)} - photo ${i + 1}" loading="lazy" /></div>`,
              )
              .join("")
          : `<div class="map-card-noimg"></div>`;

        // Dots : tous rendus dans une piste qui glisse ; hors fenêtre = scale(0)
        const MAX_DOTS = 5;
        const DOT_W = 6;
        const DOT_GAP = 6;
        const dotsHtml = hasSlider
          ? Array.from({ length: total }, (_, i) =>
              `<button type="button" class="map-dot" data-index="${i}" aria-label="Photo ${i + 1} sur ${total}"><span class="map-dot-inner"></span></button>`,
            ).join("")
          : "";

        const el = document.createElement("div");
        el.innerHTML = `
          <div class="map-pin">
            <span class="map-pin-label">${escapeHtml(formatPriceShort(p.price))}</span>
            <div class="map-pin-card">
              <div class="map-pin-slider">
                ${total > 0 ? `<div class="map-slide-track" style="width:${total * 100}%">${slidesHtml}</div>` : slidesHtml}
                ${
                  hasSlider
                    ? `<button type="button" class="map-slide-prev" aria-label="Photo précédente">‹</button>
                       <button type="button" class="map-slide-next" aria-label="Photo suivante">›</button>
                       <div class="map-dots" role="tablist" aria-label="Photos">
                         <div class="map-dots-track">${dotsHtml}</div>
                       </div>`
                    : ""
                }
              </div>
              <a href="/biens/${escapeHtml(p.slug)}" class="map-pin-body">
                <span class="map-pin-title">${escapeHtml(p.title)}</span>
                <span class="map-pin-price">${escapeHtml(formatPrice(p.price))}</span>
                <span class="map-pin-details">${escapeHtml(p.city)} · ${escapeHtml(formatSurface(p.surface))} · ${p.rooms} p.</span>
              </a>
            </div>
          </div>`;

        // Slider logic — même approche que property-card-carousel (transform,
        // piste de dots avec scale(0) hors fenêtre).
        if (hasSlider) {
          let idx = 0;
          const slider = el.querySelector(".map-pin-slider") as HTMLElement;
          const track = slider.querySelector(".map-slide-track") as HTMLElement;
          const dots = Array.from(
            slider.querySelectorAll<HTMLButtonElement>(".map-dot"),
          );
          const dotsTrack = slider.querySelector(".map-dots-track") as HTMLElement;
          const dotsWrap = slider.querySelector(".map-dots") as HTMLElement;

          const viewportW =
            Math.min(MAX_DOTS, total) * (DOT_W + DOT_GAP) - DOT_GAP;
          dotsWrap.style.width = `${viewportW}px`;
          dotsTrack.style.width = `${total * (DOT_W + DOT_GAP) - DOT_GAP}px`;

          function updateDots() {
            let dotStart = 0;
            if (total > MAX_DOTS) {
              const half = Math.floor(MAX_DOTS / 2);
              dotStart = Math.max(
                0,
                Math.min(idx - half, total - MAX_DOTS),
              );
            }
            const dotEnd = dotStart + Math.min(MAX_DOTS, total);
            dotsTrack.style.transform = `translateX(-${dotStart * (DOT_W + DOT_GAP)}px)`;
            dots.forEach((dot, i) => {
              const inWindow = i >= dotStart && i < dotEnd;
              dot.classList.toggle("is-active", i === idx);
              dot.classList.toggle("is-visible", inWindow);
              dot.setAttribute("aria-selected", i === idx ? "true" : "false");
              dot.tabIndex = inWindow ? 0 : -1;
            });
          }

          function goTo(n: number) {
            idx = ((n % total) + total) % total;
            track.style.transform = `translateX(-${(idx * 100) / total}%)`;
            updateDots();
          }

          updateDots();

          slider
            .querySelector(".map-slide-prev")
            ?.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              goTo(idx - 1);
            });
          slider
            .querySelector(".map-slide-next")
            ?.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              goTo(idx + 1);
            });
          dots.forEach((dot) => {
            dot.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              goTo(parseInt(dot.dataset.index || "0", 10));
            });
          });

          // Touch swipe
          let touchStart: { x: number; y: number } | null = null;
          slider.addEventListener(
            "touchstart",
            (e) => {
              const t = e.touches[0];
              touchStart = { x: t.clientX, y: t.clientY };
            },
            { passive: true },
          );
          slider.addEventListener(
            "touchend",
            (e) => {
              if (!touchStart) return;
              const t = e.changedTouches[0];
              const dx = t.clientX - touchStart.x;
              const dy = t.clientY - touchStart.y;
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                if (dx < 0) goTo(idx + 1);
                else goTo(idx - 1);
              }
              touchStart = null;
            },
            { passive: true },
          );
        }

        // Les clics DANS la carte (dots, prev/next, gap, bordures) ne doivent
        // ni fermer la bulle, ni déclencher un nouveau collapseActive. Seul
        // le lien <a class="map-pin-body"> doit naviguer. Le reste = no-op.
        const cardEl = el.querySelector(".map-pin-card") as HTMLElement | null;
        cardEl?.addEventListener("click", (e) => {
          if (!(e.target as HTMLElement).closest("a")) {
            e.stopPropagation();
          }
        });

        const marker = el.querySelector(".map-pin") as HTMLElement;
        marker.addEventListener("click", (e) => {
          e.stopPropagation();
          if ((e.target as HTMLElement).closest("a")) return;
          if (marker === activeMarker) {
            collapseActive();
            return;
          }
          collapseActive();
          marker.classList.add("is-expanded");
          el.style.zIndex = "100";
          activeMarker = marker;
        });

        new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([p.longitude, p.latitude])
          .addTo(map);

        bounds.extend([p.longitude, p.latitude]);
        hasMarkers = true;
      }

      if (hasMarkers) {
        map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      }

      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
          visualizePitch: false,
        }),
        "top-right",
      );

      const emitBounds = () => {
        if (!onBoundsChangeRef.current) return;
        const b = map.getBounds();
        onBoundsChangeRef.current({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      };
      map.on("load", emitBounds);
      map.on("moveend", emitBounds);
      map.on("zoomend", emitBounds);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [properties]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full overflow-hidden z-0"
    />
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
