import { createClient } from "@repo/shared/supabase/server";
import { sanitizeFilterValue } from "@repo/shared/utils";
import { PropertyCardMagazine } from "@/components/property-card-magazine";
import { BiensFiltersSidebar } from "@/components/biens-filters-sidebar";
import { BiensControlsBar } from "@/components/biens-controls-bar";
import { BiensViewFab } from "@/components/biens-view-fab";
import { MapSplitView } from "@/components/map-split-view";
import { Pagination } from "@repo/ui/custom-pagination";
import type { PropertyWithMedia } from "@repo/shared/supabase/types";
import type { Metadata } from "next";
import type { MapProperty } from "@/lib/data";
import { clientConfig } from "@repo/shared/client-config";
import { PropertyAlertInline } from "@/components/property-alert-inline";

export const metadata: Metadata = {
  title: "Nos biens",
  description: `Le catalogue des biens immobiliers ${clientConfig.agencyName}.`,
  alternates: { canonical: "/biens" },
  openGraph: {
    title: `Nos biens · ${clientConfig.agencyFullName}`,
    description: `Le catalogue des biens immobiliers ${clientConfig.agencyName}.`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

const PER_PAGE = 12;

type SearchParams = Record<string, string | undefined>;

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const view = (params.vue as "grid" | "map") || "grid";

  // Layout unifié entre vue grille et vue carte pour que la controls bar
  // ne démonte pas pendant la transition (fluidité). Pas de title band —
  // la controls bar (recherche + tri + vue) est directement sous le header.
  const isMap = view === "map";
  return (
    <div
      className={isMap ? "flex flex-col" : ""}
      style={isMap ? { height: "calc(100dvh - 76px)" } : undefined}
    >
      {/* Ancre pour le scroll automatique (filtres / pagination / retour vue
          grille). Placée avant le sticky wrapper : sa position dans le doc
          reste stable, contrairement à la bar sticky dont `offsetTop` devient
          instable une fois collée. */}
      {!isMap && <div data-biens-bar-anchor aria-hidden="true" />}

      {/* Controls bar — sticky sous le header en grille, shrink-0 en carte.
          Présente dans les deux vues au même niveau pour éviter le démontage
          qui fait flasher un skeleton pendant la transition. */}
      <div
        className={isMap ? "shrink-0" : "sticky top-[77px] z-30"}
        style={{ background: "var(--paper-raw)" }}
      >
        <section
          className={
            isMap
              ? "w-full px-6 lg:px-10"
              : "max-w-[1440px] mx-auto px-6 lg:px-10"
          }
        >
          <ControlsBar inMapView={isMap} />
        </section>
      </div>

      {/* Contenu principal — map flex-1 OU grille + sidebar.
          key={view} force un remount côté React mais déclenche l'animation
          `.view-swap` (fade in doux 280ms) pour que la transition ne soit
          pas abrupte. */}
      {isMap ? (
        <div key="map" className="flex-1 min-h-0 relative">
          <MapContent params={params} />
        </div>
      ) : (
        <section
          key="grid"
          className="max-w-[1440px] mx-auto px-6 lg:px-10 pb-28"
        >
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Sidebar — uniquement à partir de lg (1024px). En mobile/tablet
                on bascule sur le drawer Filtres dans la controls bar. */}
            <aside className="hidden lg:col-span-3 lg:block">
              <ArrondSidebar />
            </aside>

            {/* Grille à droite — padding-top dédié pour aérer entre la
                controls bar et la première rangée de cards (sans affecter
                la hauteur disponible de la sidebar). */}
            <div className="lg:col-span-9 pt-6">
              <Content params={params} />
            </div>
          </div>
        </section>
      )}

      {/* FAB toggle Carte/Liste — mobile only, visible dans les deux vues */}
      <BiensViewFab />
    </div>
  );
}

async function MapContent({ params }: { params: SearchParams }) {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select("*, property_media(id, url, position, alt_text, property_id)")
    .eq("is_published", true);
  query = applyFilters(query, params);

  const [propsRes, mapProps] = await Promise.all([
    query.order("created_at", { ascending: false }).limit(200),
    fetchMapProperties(params),
  ]);

  const properties = (propsRes.data as PropertyWithMedia[] | null) ?? [];

  return <MapSplitView properties={properties} mapProperties={mapProps} />;
}

async function fetchLocations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("postal_code, city")
    .eq("is_published", true);

  const codeCount = new Map<string, number>();
  const cityCount = new Map<string, number>();

  (data as { postal_code: string | null; city: string | null }[] | null)?.forEach(
    (row) => {
      // 1) Tenter le code postal (le plus fiable)
      const code = parseArrondissement(row.postal_code);
      if (code) {
        codeCount.set(code, (codeCount.get(code) || 0) + 1);
        return;
      }
      // 2) Fallback sur le champ `city` quand il commence par "Paris" :
      //    extraire l'arrondissement (ex. "Paris 16ème arrondissement").
      const cityRaw = row.city?.trim();
      if (!cityRaw) return;
      if (/^paris/i.test(cityRaw)) {
        const m = cityRaw.match(/(\d{1,2})/);
        if (m) {
          const n = Number(m[1]);
          if (n >= 1 && n <= 20) {
            const arr = n === 1 ? "1ᵉʳ" : `${n}ᵉ`;
            codeCount.set(arr, (codeCount.get(arr) || 0) + 1);
            return;
          }
        }
        return; // "Paris" sans arrondissement détectable → ne pas mettre dans Autres villes
      }
      // 3) Vraie ville hors Paris
      cityCount.set(cityRaw, (cityCount.get(cityRaw) || 0) + 1);
    },
  );

  const arrondissements = Array.from(codeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, label: `Paris ${code}`, count }));

  const cities = Array.from(cityCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([city, count]) => ({ city, count }));

  return { arrondissements, cities };
}

async function ControlsBar({ inMapView = false }: { inMapView?: boolean }) {
  const supabase = await createClient();
  const [totalRes, venteRes, locRes, locations] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .eq("transaction_type", "vente"),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .eq("transaction_type", "location"),
    fetchLocations(),
  ]);

  const counts: { value: "all" | "vente" | "location"; label: string; count: number }[] = [
    { value: "all", label: "Tout", count: totalRes.count ?? 0 },
    { value: "vente", label: "À la vente", count: venteRes.count ?? 0 },
    { value: "location", label: "À louer", count: locRes.count ?? 0 },
  ];

  return (
    <BiensControlsBar
      counts={counts}
      arrondissements={locations.arrondissements}
      cities={locations.cities}
      alwaysShowFiltersButton={inMapView}
    />
  );
}

async function ArrondSidebar() {
  const { arrondissements, cities } = await fetchLocations();
  return <BiensFiltersSidebar arrondissements={arrondissements} cities={cities} />;
}

async function Content({ params }: { params: SearchParams }) {
  const supabase = await createClient();
  const page = Math.max(1, Number(params.page) || 1);
  const tri = params.tri || "recent";
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    recent: { column: "created_at", ascending: false },
    prix_asc: { column: "price", ascending: true },
    prix_desc: { column: "price", ascending: false },
    surface_desc: { column: "surface", ascending: false },
  };
  const sort = sortMap[tri] || sortMap.recent;
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let query = supabase
    .from("properties")
    .select("*, property_media(id, url, position, alt_text, property_id)", {
      count: "exact",
    })
    .eq("is_published", true);
  query = applyFilters(query, params);

  const propsRes = await query
    .order(sort.column, { ascending: sort.ascending })
    .range(from, to);

  const properties = propsRes.data as PropertyWithMedia[] | null;
  const count = propsRes.count ?? 0;
  const totalPages = Math.ceil(count / PER_PAGE);

  return (
    <>
      {count === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {properties!.map((property, idx) => (
              <PropertyCardMagazine
                key={property.id}
                property={property}
                index={idx}
                priority={idx < 3}
                static
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-16">
              <Pagination totalPages={totalPages} currentPage={page} />
            </div>
          )}
        </>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="py-16">
      <div className="chapter-mark mb-6">Nº 00 — Recherche sans résultat</div>
      <h2
        className="h-display"
        style={{ fontSize: "clamp(32px, 4.5vw, 52px)" }}
      >
        Aucun bien ne correspond
        <br />
        <em className="h-italic" style={{ color: "var(--cobalt)" }}>
          à votre recherche.
        </em>
      </h2>
      <p
        className="mt-6 text-[15px] leading-relaxed max-w-[540px]"
        style={{
          color: "color-mix(in oklch, var(--ink-raw) 72%, transparent)",
        }}
      >
        Soyez alerté dès qu&apos;un bien correspondant à vos critères est
        publié. Sinon, élargissez les filtres ou passez au Cabinet — nous
        suivons bien plus de biens que ceux affichés en ligne.
      </p>
      <div className="mt-8 max-w-[480px]">
        <PropertyAlertInline />
      </div>
      <div className="mt-10 pt-6 rule flex flex-wrap gap-x-6 gap-y-2 h-small-caps">
        <a
          href="/biens"
          className="pb-0.5 hover:text-[color:var(--cobalt)]"
          style={{ borderBottom: "1px solid currentColor" }}
        >
          Réinitialiser les filtres
        </a>
        <a
          href="/contact"
          className="hover:text-[color:var(--cobalt)]"
          style={{
            color: "color-mix(in oklch, var(--ink-raw) 60%, transparent)",
          }}
        >
          Nous contacter
        </a>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function parseArrondissement(postal: string | null | undefined): string | null {
  if (!postal) return null;
  const m = /^750?(\d{1,2})$/.exec(postal.trim());
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 20) return null;
  return n === 1 ? "1ᵉʳ" : `${n}ᵉ`;
}

async function fetchMapProperties(
  params: SearchParams,
): Promise<MapProperty[]> {
  const supabase = await createClient();
  let q = supabase
    .from("properties")
    .select(
      "id, slug, title, price, city, type, transaction_type, surface, rooms, latitude, longitude, property_media(url, position)",
    )
    .eq("is_published", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  q = applyFilters(q, params);

  const { data } = await q.order("created_at", { ascending: false }).limit(200);
  if (!data) return [];

  return (
    data as Array<{
      id: string;
      slug: string;
      title: string;
      price: number;
      city: string;
      type: string;
      transaction_type: string;
      surface: number;
      rooms: number;
      latitude: number;
      longitude: number;
      property_media: { url: string; position: number }[];
    }>
  ).map((p) => {
    const sorted = [...(p.property_media || [])].sort(
      (a, b) => a.position - b.position,
    );
    const urls = sorted.map((m) => m.url);
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price,
      city: p.city,
      type: p.type,
      transaction_type: p.transaction_type,
      surface: p.surface,
      rooms: p.rooms,
      latitude: p.latitude,
      longitude: p.longitude,
      image_url: urls[0] ?? null,
      image_urls: urls,
    };
  });
}

function applyFilters<T>(query: T, params: SearchParams) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any;
  const normalizeVille = (v: string) =>
    v.replace(/(\d+)\s*(?:ème|eme|è|er)?\s*e?(?=\s|,|$)/gi, "$1");

  // Helper : split CSV → liste, trim + drop empties
  const splitCsv = (s: string | undefined) =>
    s?.split(",").map((v) => v.trim()).filter(Boolean) ?? [];

  // Les biens vendus / loués restent visibles avec leur badge — preuve sociale.
  // Pour les masquer ponctuellement : ?hide_sold=1
  if (params.hide_sold === "1") {
    q = q.is("sold_at", null);
  }

  if (params.q) {
    const k = `%${sanitizeFilterValue(normalizeVille(params.q))}%`;
    q = q.or(
      `title.ilike.${k},description.ilike.${k},city.ilike.${k},address.ilike.${k}`,
    );
  }
  // Type — multi-select : OU logique entre les types
  const types = splitCsv(params.type);
  if (types.length === 1) q = q.eq("type", types[0]);
  else if (types.length > 1) q = q.in("type", types);

  if (params.transaction) q = q.eq("transaction_type", params.transaction);
  if (params.prix_min) q = q.gte("price", Number(params.prix_min));
  if (params.prix_max) q = q.lte("price", Number(params.prix_max));

  // Localisation — multi-select : on accepte un OU entre toutes les zones
  // sélectionnées (arrondissements + villes hors Paris).
  const arrs = splitCsv(params.arr);
  const villes = splitCsv(params.ville);
  if (arrs.length > 0 || villes.length > 0) {
    const orTerms: string[] = [];
    for (const a of arrs) {
      const m = /^(\d{1,2})/.exec(a);
      if (m) {
        const n = Number(m[1]);
        const padded = String(n).padStart(2, "0");
        // Le 16e est en 75016 OU 75116 (rive sud) ; les autres en 750XX.
        orTerms.push(`postal_code.eq.750${padded}`);
        orTerms.push(`postal_code.eq.751${padded}`);
      }
    }
    for (const v of villes) {
      orTerms.push(`city.ilike.%${normalizeVille(v)}%`);
    }
    if (orTerms.length > 0) q = q.or(orTerms.join(","));
  }

  if (params.surface_min) q = q.gte("surface", Number(params.surface_min));
  if (params.surface_max) q = q.lte("surface", Number(params.surface_max));

  // Pièces — multi-select : OU entre les valeurs (avec 5+ qui devient ≥ 5)
  const pieces = splitCsv(params.pieces).map(Number).filter((n) => !isNaN(n));
  if (pieces.length === 1) {
    const p = pieces[0];
    if (p >= 5) q = q.gte("rooms", 5);
    else q = q.eq("rooms", p);
  } else if (pieces.length > 1) {
    const exact = pieces.filter((p) => p < 5);
    const has5plus = pieces.some((p) => p >= 5);
    if (has5plus && exact.length > 0) {
      const orPieces = [
        ...exact.map((p) => `rooms.eq.${p}`),
        "rooms.gte.5",
      ];
      q = q.or(orPieces.join(","));
    } else if (has5plus) {
      q = q.gte("rooms", 5);
    } else {
      q = q.in("rooms", exact);
    }
  }

  // Features — déjà multi-select : ET logique (le bien doit avoir TOUTES
  // les features cochées, ex. balcon + ascenseur).
  if (params.features) {
    const feats = splitCsv(params.features);
    for (const f of feats) {
      q = q.contains("features", [f]);
    }
  }
  return q as T;
}
