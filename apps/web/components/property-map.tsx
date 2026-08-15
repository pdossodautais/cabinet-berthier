"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Car,
  Bike,
  Footprints,
  TrainFront,
  Search,
  X,
  ArrowUpRight,
  LocateFixed,
} from "lucide-react";
import { Input } from "@repo/ui/input";

type Mode = "driving" | "transit" | "bicycling" | "walking";

// Vitesses moyennes en km/h — observées dans Paris intra-muros (ordres
// de grandeur, pas un calcul d'itinéraire réel). Utilisées pour estimer
// la durée de trajet à partir de la distance à vol d'oiseau corrigée.
const MODE_SPEEDS: Record<Mode, number> = {
  driving: 20,
  transit: 22,
  bicycling: 14,
  walking: 4.5,
};

// Correction distance à vol d'oiseau → distance réelle (ratio moyen urbain).
const ROUTE_FACTOR = 1.35;

const MODES: { value: Mode; label: string; icon: typeof Car }[] = [
  { value: "driving", label: "Voiture", icon: Car },
  { value: "transit", label: "Transports", icon: TrainFront },
  { value: "bicycling", label: "Vélo", icon: Bike },
  { value: "walking", label: "À pied", icon: Footprints },
];

// Destinations pré-enregistrées — Paris & Île-de-France.
// Coordonnées WGS84, vérifiées via OSM.
const QUICK_DESTINATIONS: Array<{ label: string; lat: number; lng: number }> = [
  { label: "Gare de Lyon", lat: 48.8443, lng: 2.3735 },
  { label: "Gare du Nord", lat: 48.8809, lng: 2.3553 },
  { label: "Gare Saint-Lazare", lat: 48.8756, lng: 2.3248 },
  { label: "Aéroport CDG", lat: 49.0097, lng: 2.5479 },
  { label: "Aéroport Orly", lat: 48.7233, lng: 2.3794 },
  { label: "Tour Eiffel", lat: 48.8584, lng: 2.2945 },
  { label: "Arc de Triomphe", lat: 48.8738, lng: 2.295 },
  { label: "Louvre", lat: 48.8606, lng: 2.3376 },
  { label: "Opéra Garnier", lat: 48.8717, lng: 2.3318 },
  { label: "Notre-Dame", lat: 48.853, lng: 2.3499 },
  { label: "La Défense", lat: 48.8925, lng: 2.2383 },
];

const TILE_STYLE = "https://tiles.openfreemap.org/styles/bright";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes - h * 60);
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, "0")}`;
}

const HOUSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createPropertyMarker(
  address: string,
  onMarkerClick: () => void,
): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = `
    <div class="map-property-marker">
      <span class="map-property-icon">${HOUSE_SVG}</span>
      <span class="map-property-label">${escapeHtml(address)}</span>
    </div>`;

  const marker = el.querySelector(".map-property-marker") as HTMLElement;
  el.addEventListener("click", () => {
    marker.classList.toggle("is-expanded");
    onMarkerClick();
  });

  return el;
}

function createDestMarker(): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "map-dest-marker";
  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`;
  return el;
}

export function PropertyMap({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  address: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [mode, setMode] = useState<Mode>("driving");
  const [dest, setDest] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [highlight, setHighlight] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function showDestination(
    map: maplibregl.Map,
    lat: number,
    lng: number,
    label: string,
  ) {
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }

    if (map.getLayer("dest-line-layer")) map.removeLayer("dest-line-layer");
    if (map.getSource("dest-line")) map.removeSource("dest-line");

    const maplibregl = (
      window as unknown as { maplibregl: typeof import("maplibre-gl") }
    ).maplibregl;
    const destEl = createDestMarker();
    destMarkerRef.current = new maplibregl.Marker({
      element: destEl,
      anchor: "bottom",
    })
      .setLngLat([lng, lat])
      .addTo(map);

    map.addSource("dest-line", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [longitude, latitude],
            [lng, lat],
          ],
        },
      },
    });

    map.addLayer({
      id: "dest-line-layer",
      type: "line",
      source: "dest-line",
      paint: {
        "line-color": "#9c7c4f",
        "line-width": 1.5,
        "line-dasharray": [3, 3],
        "line-opacity": 0.85,
      },
    });

    // Fit bounds to show both points
    const bounds = new maplibregl.LngLatBounds()
      .extend([longitude, latitude])
      .extend([lng, lat]);
    map.fitBounds(bounds, { padding: 80, maxZoom: 15, duration: 800 });

    setDest({ lat, lng, label });
  }

  function clearDest() {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
    if (map.getLayer("dest-line-layer")) map.removeLayer("dest-line-layer");
    if (map.getSource("dest-line")) map.removeSource("dest-line");
    setDest(null);
    setQuery("");
    setSuggestions([]);
    setHighlight(-1);
    map.flyTo({ center: [longitude, latitude], zoom: 15, duration: 700 });
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleSearchInput(value: string) {
    setQuery(value);
    setHighlight(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=fr`,
        );
        setSuggestions(await res.json());
      } catch {
        setSuggestions([]);
      }
    }, 400);
  }

  function selectSuggestion(s: {
    display_name: string;
    lat: string;
    lon: string;
  }) {
    const label = s.display_name.split(",")[0];
    setQuery(label);
    setSuggestions([]);
    setHighlight(-1);
    if (mapInstanceRef.current) {
      showDestination(
        mapInstanceRef.current,
        parseFloat(s.lat),
        parseFloat(s.lon),
        label,
      );
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(
        (h) => (h - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setHighlight(-1);
    }
  }

  function selectQuickDest(d: (typeof QUICK_DESTINATIONS)[number]) {
    setQuery(d.label);
    setSuggestions([]);
    setHighlight(-1);
    if (mapInstanceRef.current) {
      showDestination(mapInstanceRef.current, d.lat, d.lng, d.label);
    }
  }

  const gmapsUrl = dest
    ? `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${dest.lat},${dest.lng}&travelmode=${mode}`
    : null;

  const distKm = dest ? haversineKm(latitude, longitude, dest.lat, dest.lng) : 0;
  const durationMin = useMemo(() => {
    if (!dest) return 0;
    return ((distKm * ROUTE_FACTOR) / MODE_SPEEDS[mode]) * 60;
  }, [dest, distKm, mode]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("maplibre-gl").then((maplibregl) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      (window as unknown as { maplibregl: typeof maplibregl }).maplibregl =
        maplibregl;

      const map = new maplibregl.Map({
        container: mapRef.current,
        style: TILE_STYLE,
        center: [longitude, latitude],
        zoom: 15,
        doubleClickZoom: false,
        attributionControl: {},
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        bearing: 0,
        pitch: 0,
        maxPitch: 0,
        // Cooperative gestures uniquement sur mobile : 1 doigt scrolle la
        // page, 2 doigts bougent la carte — évite le piège où le visiteur
        // ne peut plus sortir de la carte en scrollant. Sur desktop on
        // laisse la molette zoomer directement sans Ctrl, comportement
        // attendu sur une liste+carte où l'utilisateur vient explorer.
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

      let skipNextMapClick = false;
      const markerEl = createPropertyMarker(address, () => {
        skipNextMapClick = true;
      });

      new maplibregl.Marker({ element: markerEl, anchor: "bottom" })
        .setLngLat([longitude, latitude])
        .addTo(map);

      map.on("click", (e) => {
        if (skipNextMapClick) {
          skipNextMapClick = false;
          return;
        }
        showDestination(
          map,
          e.lngLat.lat,
          e.lngLat.lng,
          `Point sur la carte (${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)})`,
        );
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, address]);

  const CurrentModeIcon = (MODES.find((m) => m.value === mode) ?? MODES[0])
    .icon;

  return (
    <div aria-label="Localisation et temps de trajet">
      {/* Adresse + distance/durée */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pb-4 border-b border-hairline">
        <p className="text-[15px] md:text-[16px] text-ink leading-[1.4]">
          {address}
        </p>
        {dest && (
          <div
            className="mono text-[12px] text-ink-muted tracking-[0.04em] shrink-0"
            aria-live="polite"
          >
            <span className="text-ink-subtle uppercase text-[10px] tracking-[0.14em] mr-2">
              {dest.label}
            </span>
            {distKm.toFixed(1)} km
            <span className="mx-1.5 text-ink-subtle">·</span>
            {formatDuration(durationMin)}
          </div>
        )}
      </div>

      {/* Mode + recherche */}
      <div className="py-5 space-y-4 border-b border-hairline">
        <div
          className="flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Mode de transport"
        >
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.value)}
                className={`inline-flex items-center gap-2 h-8 px-4 text-[12px] tracking-[0.02em] rounded-full border transition-colors ${
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink-2 border-hairline-strong hover:border-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.4} />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search
            className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle pointer-events-none"
            strokeWidth={1.4}
          />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une destination (adresse, lieu)…"
            aria-label="Rechercher une adresse de destination"
            aria-autocomplete="list"
            aria-expanded={suggestions.length > 0}
            aria-controls="dest-suggestions"
            className="w-full h-10 bg-transparent border-0 border-b border-hairline-strong pl-7 pr-7 text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none focus:border-ink rounded-none transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setHighlight(-1);
              }}
              aria-label="Effacer la recherche"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={1.4} />
            </button>
          )}
          {suggestions.length > 0 && (
            <ul
              id="dest-suggestions"
              role="listbox"
              aria-label="Suggestions d'adresses"
              className="absolute z-50 top-full left-0 right-0 mt-1 bg-paper border border-hairline-strong max-h-60 overflow-auto shadow-[0_4px_20px_oklch(0_0_0/0.08)]"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.lat}-${s.lon}`}
                  role="option"
                  aria-selected={i === highlight}
                >
                  <button
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`w-full text-left px-4 py-3 text-[13px] border-b border-hairline last:border-b-0 transition-colors ${
                      i === highlight
                        ? "bg-ivory-2 text-ink"
                        : "bg-paper text-ink-2 hover:bg-ivory-2"
                    }`}
                  >
                    {s.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Destinations fréquentes */}
      <div className="py-5 border-b border-hairline">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-3">Destinations fréquentes</div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_DESTINATIONS.map((d) => {
            const isActive = dest?.label === d.label;
            return (
              <button
                key={d.label}
                type="button"
                onClick={() => selectQuickDest(d)}
                aria-pressed={isActive}
                className={`inline-flex items-center h-7 px-2.5 text-[11px] tracking-[0.01em] border transition-colors ${
                  isActive
                    ? "bg-ink text-paper border-ink"
                    : "bg-transparent text-ink-muted border-hairline hover:border-ink hover:text-ink"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Carte */}
      <div className="relative mt-5">
        <div
          ref={mapRef}
          role="region"
          aria-label="Carte de localisation du bien"
          className="w-full border border-hairline"
          style={{ height: 440 }}
        />
        <button
          type="button"
          onClick={() => {
            const map = mapInstanceRef.current;
            if (!map) return;
            clearDest();
          }}
          aria-label="Recentrer sur le bien"
          className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 bg-paper border border-hairline-strong px-3 h-9 text-[11px] tracking-[0.02em] text-ink hover:border-ink transition-colors shadow-[0_1px_3px_oklch(0_0_0/0.08)]"
        >
          <LocateFixed className="h-3.5 w-3.5" strokeWidth={1.4} />
          Recentrer
        </button>
      </div>

      {/* CTA Itinéraire Google Maps */}
      {dest ? (
        <div className="mt-4 flex justify-end">
          <a
            href={gmapsUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 bg-ink text-paper text-[12px] tracking-[0.02em] hover:bg-ink-2 transition-colors"
          >
            <CurrentModeIcon className="h-3.5 w-3.5" strokeWidth={1.4} />
            Itinéraire sur Google Maps
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.4} />
          </a>
        </div>
      ) : (
        <p className="mt-4 text-[11px] text-ink-subtle italic">
          Cherchez une adresse, cliquez une destination rapide ou pointez un
          lieu sur la carte.
        </p>
      )}
    </div>
  );
}
