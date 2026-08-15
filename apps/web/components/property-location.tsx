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
  MapPin,
} from "lucide-react";

type Mode = "driving" | "transit" | "bicycling" | "walking";

const MODE_SPEEDS: Record<Mode, number> = {
  driving: 20,
  transit: 22,
  bicycling: 14,
  walking: 4.5,
};
const ROUTE_FACTOR = 1.35;

const MODES: { value: Mode; label: string; icon: typeof Car }[] = [
  { value: "driving", label: "Voiture", icon: Car },
  { value: "transit", label: "Transports", icon: TrainFront },
  { value: "bicycling", label: "Vélo", icon: Bike },
  { value: "walking", label: "À pied", icon: Footprints },
];

const QUICK_DESTINATIONS: Array<{ label: string; lat: number; lng: number }> = [
  { label: "Gare de Lyon", lat: 48.8443, lng: 2.3744 },
  { label: "Gare du Nord", lat: 48.881, lng: 2.3554 },
  { label: "Gare Saint-Lazare", lat: 48.8762, lng: 2.3253 },
  { label: "Aéroport CDG", lat: 49.0097, lng: 2.5479 },
  { label: "Aéroport Orly", lat: 48.7254, lng: 2.3595 },
  { label: "Tour Eiffel", lat: 48.8584, lng: 2.2945 },
  { label: "Arc de Triomphe", lat: 48.8738, lng: 2.295 },
  { label: "Louvre", lat: 48.8606, lng: 2.3376 },
  { label: "Opéra Garnier", lat: 48.8717, lng: 2.3316 },
  { label: "Notre-Dame", lat: 48.853, lng: 2.3499 },
  { label: "La Défense", lat: 48.8924, lng: 2.2361 },
];

const TILE_STYLE = "https://tiles.openfreemap.org/styles/bright";

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(min: number): string {
  if (min < 1) return "< 1 min";
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export function PropertyLocation({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  address: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("maplibre-gl").Map | null>(null);
  const destMarkerRef = useRef<import("maplibre-gl").Marker | null>(null);

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
    map: import("maplibre-gl").Map,
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

    const destEl = document.createElement("div");
    destEl.style.cssText =
      "background:var(--cobalt);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--paper-raw);box-shadow:0 4px 12px rgba(22,68,168,0.35);cursor:pointer";
    destEl.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>';

    destMarkerRef.current = new maplibregl.Marker({
      element: destEl,
      anchor: "center",
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
        "line-color": "#1644a8",
        "line-width": 1.5,
        "line-dasharray": [3, 3],
        "line-opacity": 0.75,
      },
    });

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
        attributionControl: { compact: true },
        doubleClickZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        bearing: 0,
        pitch: 0,
        maxPitch: 0,
      });
      map.touchZoomRotate.disableRotation();

      const markerEl = document.createElement("div");
      markerEl.style.cssText =
        "background:var(--cobalt);width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid var(--paper-raw);box-shadow:0 6px 20px rgba(22,68,168,0.45);cursor:default";
      markerEl.innerHTML =
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.5-7-12a7 7 0 0 1 14 0c0 4.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';

      new maplibregl.Marker({ element: markerEl, anchor: "center" })
        .setLngLat([longitude, latitude])
        .addTo(map);

      let skipNextClick = false;
      markerEl.addEventListener("click", () => {
        skipNextClick = true;
      });

      map.on("click", (e) => {
        if (skipNextClick) {
          skipNextClick = false;
          return;
        }
        showDestination(
          map,
          e.lngLat.lat,
          e.lngLat.lng,
          `Point (${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)})`,
        );
      });

      mapInstanceRef.current = map;
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  const CurrentModeIcon = (MODES.find((m) => m.value === mode) ?? MODES[0])
    .icon;

  const inputCls =
    "w-full min-h-11 bg-transparent border border-[var(--bone-raw)] px-4 py-3 text-[16px] focus:outline-none focus:border-[var(--cobalt)] transition-colors";

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 gap-0"
      style={{ border: "1px solid var(--bone-raw)" }}
      aria-label="Localisation et trajet"
    >
      {/* Carte — col 7/12 desktop, full width mobile */}
      <div className="lg:col-span-7 relative order-2 lg:order-1 min-w-0">
        <div
          ref={mapRef}
          role="region"
          aria-label="Carte de localisation"
          className="w-full h-full"
          style={{ minHeight: 360, aspectRatio: "4 / 3" }}
        />
        {/* Overlay adresse top-left */}
        <div
          className="absolute top-4 left-4 px-4 py-3 text-[11px] tracking-[0.18em] uppercase pointer-events-none z-10"
          style={{
            background: "var(--paper-raw)",
            border: "1px solid var(--bone-raw)",
            color: "var(--ink-raw)",
            maxWidth: "calc(100% - 2rem)",
          }}
        >
          {address}
        </div>
        {/* Bouton Recentrer */}
        {dest && (
          <button
            type="button"
            onClick={clearDest}
            aria-label="Recentrer sur le bien"
            className="absolute bottom-4 left-4 inline-flex items-center gap-2 h-9 px-3 text-[11px] tracking-[0.12em] uppercase hover:bg-[var(--ivory-raw)] transition-colors z-10"
            style={{
              background: "var(--paper-raw)",
              border: "1px solid var(--ink-raw)",
              color: "var(--ink-raw)",
            }}
          >
            <LocateFixed className="h-3.5 w-3.5" strokeWidth={1.5} />
            Recentrer
          </button>
        )}
      </div>

      {/* Panel droit — col 5/12 desktop, full width mobile */}
      <div
        className="lg:col-span-5 order-1 lg:order-2 p-5 sm:p-6 lg:p-8 space-y-6 min-w-0"
        style={{
          background: "var(--paper-raw)",
          borderLeft: "1px solid var(--bone-raw)",
        }}
      >
        {/* Header : distance/durée si dest, sinon eyebrow */}
        {dest ? (
          <div>
            <div
              className="h-eyebrow mb-2"
              style={{ color: "var(--cobalt)" }}
            >
              ¶ Trajet estimé
            </div>
            <div
              className="h-display tabular mb-1"
              style={{ fontSize: 32, color: "var(--ink-raw)" }}
            >
              {formatDuration(durationMin)}
            </div>
            <div
              className="mono text-[11px] tracking-[0.14em] uppercase"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
              }}
            >
              <span className="tabular">{distKm.toFixed(1)} km</span>
              <span className="mx-2">·</span>
              {dest.label}
            </div>
          </div>
        ) : (
          <div>
            <div
              className="h-eyebrow mb-2"
              style={{ color: "var(--cobalt)" }}
            >
              ¶ Depuis cette adresse
            </div>
            <p
              className="text-[13px] leading-[1.6]"
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 70%, transparent)",
              }}
            >
              Cherchez une destination ou pointez un lieu sur la carte pour
              estimer un trajet.
            </p>
          </div>
        )}

        {/* Modes transport */}
        <div>
          <div
            className="h-eyebrow mb-3"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
            }}
          >
            Mode de trajet
          </div>
          <div
            className="flex flex-wrap gap-2"
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
                  className="inline-flex items-center gap-2 min-h-11 px-3 text-[12px] tracking-[0.04em] border transition-colors"
                  style={{
                    background: active ? "var(--ink-raw)" : "transparent",
                    color: active ? "var(--paper-raw)" : "var(--ink-raw)",
                    borderColor: active
                      ? "var(--ink-raw)"
                      : "var(--bone-raw)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div
            className="h-eyebrow mb-3"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
            }}
          >
            Destination
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              strokeWidth={1.5}
              style={{
                color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Adresse ou lieu…"
              aria-label="Rechercher une destination"
              className={`${inputCls} pl-10 pr-10 rounded-none`}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setHighlight(-1);
                }}
                aria-label="Effacer"
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{
                  color:
                    "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
                }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
          {suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-auto"
              style={{
                background: "var(--paper-raw)",
                border: "1px solid var(--ink-raw)",
                boxShadow: "0 4px 20px rgba(11,16,32,0.12)",
              }}
            >
              {suggestions.map((s, i) => (
                <li key={`${s.lat}-${s.lon}`} role="option" aria-selected={i === highlight}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setHighlight(i)}
                    className="w-full text-left px-4 py-3 text-[13px] transition-colors"
                    style={{
                      background:
                        i === highlight
                          ? "var(--ivory-raw)"
                          : "var(--paper-raw)",
                      color: "var(--ink-raw)",
                      borderBottom:
                        i < suggestions.length - 1
                          ? "1px solid var(--bone-raw)"
                          : "none",
                    }}
                  >
                    {s.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Destinations fréquentes */}
        <div>
          <div
            className="h-eyebrow mb-3"
            style={{
              color: "color-mix(in oklch, var(--ink-raw) 65%, transparent)",
            }}
          >
            Destinations fréquentes
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_DESTINATIONS.map((d) => {
              const isActive = dest?.label === d.label;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => selectQuickDest(d)}
                  aria-pressed={isActive}
                  className="inline-flex items-center min-h-11 px-3 text-[11px] border transition-colors"
                  style={{
                    background: isActive ? "var(--cobalt)" : "transparent",
                    color: isActive ? "white" : "var(--ink-raw)",
                    borderColor: isActive
                      ? "var(--cobalt)"
                      : "var(--bone-raw)",
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        {dest && gmapsUrl && (
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ink justify-center w-full"
          >
            <CurrentModeIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
            Ouvrir dans Google Maps
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </div>
  );
}
