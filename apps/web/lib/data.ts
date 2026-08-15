/**
 * Couche de données centralisée — toutes les requêtes Supabase publiques.
 *
 * Utilise un client Supabase « public » (lecture seule, sans cookies)
 * + unstable_cache pour l'ISR (revalidation temporelle + tags on-demand).
 *
 * Stratégie de cache (sans cacheComponents) :
 * ┌────────────────┬──────────────┬───────────────────────────┐
 * │ Donnée         │ revalidate   │ Tags                      │
 * ├────────────────┼──────────────┼───────────────────────────┤
 * │ Properties     │ 1800 (30min) │ properties                │
 * │ Property (slug)│ 1800 (30min) │ properties, property-$slug│
 * │ Settings       │ 3600 (1h)    │ settings                  │
 * │ Agents / About │ 3600 (1h)    │ agents, settings          │
 * │ Sitemap        │ 3600 (1h)    │ properties                │
 * └────────────────┴──────────────┴───────────────────────────┘
 *
 * Invalidation on-demand : POST /api/revalidate { tag: "properties" }
 *
 * ── Migration cacheComponents ──────────────────────────────────
 * Quand cacheComponents est activé dans next.config.ts, remplacer
 * chaque unstable_cache par 'use cache' + cacheLife() + cacheTag().
 * Voir les commentaires [cache-components] dans chaque fonction.
 */
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { sanitizeFilterValue } from "@repo/shared/utils";
import type {
  Agent,
  Property,
  PropertyMedia,
  PropertyDocument,
  PropertyWithMedia,
  PostWithAuthor,
  Testimonial,
} from "@repo/shared/supabase/types";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// ─── Homepage ────────────────────────────────────────────

export const getFeaturedProperties = unstable_cache(
  async (): Promise<PropertyWithMedia[]> => {
    // [cache-components] "use cache"; cacheLife("properties"); cacheTag("homepage", "properties");
    const { data } = await supabase()
      .from("properties")
      .select("*, property_media(id, url, position, alt_text, property_id)")
      .eq("is_published", true)
      .eq("is_featured", true)
      .is("sold_at", null)
      .order("created_at", { ascending: false })
      .limit(6);

    return (data as PropertyWithMedia[]) ?? [];
  },
  ["featured-properties"],
  { revalidate: 1800, tags: ["properties"] },
);

export const getLatestProperties = unstable_cache(
  async (): Promise<PropertyWithMedia[]> => {
    const { data } = await supabase()
      .from("properties")
      .select("*, property_media(id, url, position, alt_text, property_id)")
      .eq("is_published", true)
      .is("sold_at", null)
      .order("created_at", { ascending: false })
      .limit(8);

    return (data as PropertyWithMedia[]) ?? [];
  },
  ["latest-properties"],
  { revalidate: 1800, tags: ["properties"] },
);

export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    // [cache-components] "use cache"; cacheLife("static"); cacheTag("settings");
    const { data } = await supabase().from("settings").select("*");
    const map: Record<string, string> = {};
    (data as { key: string; value: string }[] | null)?.forEach(
      (s) => (map[s.key] = s.value),
    );
    return map;
  },
  ["settings"],
  { revalidate: 3600, tags: ["settings"] },
);

// ─── Property detail ─────────────────────────────────────

type PropertyDetail = Property & {
  property_media: PropertyMedia[];
  agents: Agent | null;
  property_documents: PropertyDocument[];
};

export function getPropertyBySlug(
  slug: string,
): Promise<PropertyDetail | null> {
  // [cache-components] "use cache"; cacheLife("properties"); cacheTag("properties", `property-${slug}`);
  return unstable_cache(
    async (): Promise<PropertyDetail | null> => {
      const { data } = await supabase()
        .from("properties")
        .select("*, property_media(*), agents(*), property_documents(*)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      return data as PropertyDetail | null;
    },
    ["property", slug],
    { revalidate: 1800, tags: ["properties", `property-${slug}`] },
  )();
}

interface PropertyMeta {
  title: string;
  description: string;
  city: string;
  type: string;
  transaction_type: string;
  image_url: string | null;
  price: number;
  surface: number;
  rooms: number;
}

export function getPropertyMeta(slug: string): Promise<PropertyMeta | null> {
  // [cache-components] "use cache"; cacheLife("properties"); cacheTag("properties", `property-${slug}`);
  return unstable_cache(
    async (): Promise<PropertyMeta | null> => {
      const { data } = await supabase()
        .from("properties")
        .select("title, description, city, type, transaction_type, price, surface, rooms, property_media(url, position)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (!data) return null;
      const media = (data as unknown as { property_media: { url: string; position: number }[] }).property_media ?? [];
      const sorted = [...media].sort((a, b) => a.position - b.position);
      return {
        title: data.title,
        description: data.description,
        city: data.city,
        type: data.type,
        transaction_type: data.transaction_type,
        price: data.price,
        surface: data.surface,
        rooms: data.rooms,
        image_url: sorted[0]?.url ?? null,
      };
    },
    ["property-meta", slug],
    { revalidate: 1800, tags: ["properties", `property-${slug}`] },
  )();
}

export function getSimilarProperties(
  type: string,
  transactionType: string,
  city: string,
  excludeId: string,
): Promise<PropertyWithMedia[]> {
  // [cache-components] "use cache"; cacheLife("properties"); cacheTag("properties");
  return unstable_cache(
    async (): Promise<PropertyWithMedia[]> => {
      const { data } = await supabase()
        .from("properties")
        .select("*, property_media(id, url, position, alt_text, property_id)")
        .eq("is_published", true)
        .is("sold_at", null)
        .neq("id", excludeId)
        .or(
          `type.eq.${sanitizeFilterValue(type)},city.eq.${sanitizeFilterValue(city)},transaction_type.eq.${sanitizeFilterValue(transactionType)}`,
        )
        .order("created_at", { ascending: false })
        .limit(3);

      return (data as PropertyWithMedia[]) ?? [];
    },
    ["similar-properties", type, transactionType, city, excludeId],
    { revalidate: 1800, tags: ["properties"] },
  )();
}

// ─── About page ──────────────────────────────────────────

interface AboutData {
  agents: Agent[];
  settings: Record<string, string>;
  saleCount: number;
  rentCount: number;
  agentCount: number;
}

export const getAboutData = unstable_cache(
  async (): Promise<AboutData> => {
    // [cache-components] "use cache"; cacheLife("static"); cacheTag("about", "agents");
    const db = supabase();
    const [
      { data: agents },
      { data: settings },
      { count: saleCount },
      { count: rentCount },
      { count: agentCount },
    ] = await Promise.all([
      db.from("agents").select("*").eq("is_active", true).order("last_name"),
      db.from("settings").select("*"),
      db
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("transaction_type", "vente")
        .eq("is_published", true),
      db
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("transaction_type", "location")
        .eq("is_published", true),
      db
        .from("agents")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

    const s: Record<string, string> = {};
    (settings as { key: string; value: string }[] | null)?.forEach(
      (row) => (s[row.key] = row.value),
    );

    return {
      agents: (agents as Agent[]) ?? [],
      settings: s,
      saleCount: saleCount ?? 0,
      rentCount: rentCount ?? 0,
      agentCount: agentCount ?? 0,
    };
  },
  ["about-data"],
  { revalidate: 3600, tags: ["agents", "settings", "properties"] },
);

// ─── Sitemap ─────────────────────────────────────────────

export const getSitemapProperties = unstable_cache(
  async (): Promise<
    { slug: string; updated_at: string; images: string[] }[]
  > => {
    // [cache-components] "use cache"; cacheLife("properties"); cacheTag("sitemap", "properties");
    // On remonte aussi les médias pour les image sitemaps (Google Images).
    // Limite réaliste : ~3-4 images par bien dans le sitemap, le reste est
    // crawlable via la page détail.
    const { data } = await supabase()
      .from("properties")
      .select(
        "slug, updated_at, property_media(url, position)",
      )
      .eq("is_published", true);

    type Row = {
      slug: string;
      updated_at: string;
      property_media: { url: string; position: number }[] | null;
    };

    return (
      (data as Row[] | null)?.map((p) => ({
        slug: p.slug,
        updated_at: p.updated_at,
        images: (p.property_media ?? [])
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((m) => m.url)
          .filter(Boolean),
      })) ?? []
    );
  },
  ["sitemap-properties"],
  { revalidate: 3600, tags: ["properties"] },
);

// ─── Map ────────────────────────────────────────────────

export interface MapProperty {
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
  image_url: string | null;
  image_urls: string[];
}

export const getMapProperties = unstable_cache(
  async (): Promise<MapProperty[]> => {
    // [cache-components] "use cache"; cacheLife("properties"); cacheTag("properties");
    const { data } = await supabase()
      .from("properties")
      .select(
        "id, slug, title, price, city, type, transaction_type, surface, rooms, latitude, longitude, property_media(url, position)",
      )
      .eq("is_published", true)
      .is("sold_at", null)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("created_at", { ascending: false });

    if (!data) return [];

    return (
      data as (Omit<MapProperty, "image_url" | "image_urls"> & {
        property_media: { url: string; position: number }[];
      })[]
    ).map((p) => {
      const sorted = [...p.property_media].sort(
        (a, b) => a.position - b.position,
      );
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
        image_url: sorted[0]?.url ?? null,
        image_urls: sorted.map((m) => m.url),
      };
    });
  },
  ["map-properties"],
  { revalidate: 1800, tags: ["properties"] },
);

// ─── Blog ───────────────────────────────────────────────

export const getBlogPosts = unstable_cache(
  async (): Promise<PostWithAuthor[]> => {
    const { data } = await supabase()
      .from("posts")
      .select("*, agents(first_name, last_name, photo_url)")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    return (data as PostWithAuthor[]) ?? [];
  },
  ["blog-posts"],
  { revalidate: 1800, tags: ["posts"] },
);

export function getBlogPost(slug: string): Promise<PostWithAuthor | null> {
  return unstable_cache(
    async (): Promise<PostWithAuthor | null> => {
      const { data } = await supabase()
        .from("posts")
        .select("*, agents(first_name, last_name, photo_url)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      return data as PostWithAuthor | null;
    },
    ["blog-post", slug],
    { revalidate: 1800, tags: ["posts", `post-${slug}`] },
  )();
}

export const getBlogSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const { data } = await supabase()
      .from("posts")
      .select("slug")
      .eq("is_published", true);
    return (data as { slug: string }[] | null)?.map((p) => p.slug) ?? [];
  },
  ["blog-slugs"],
  { revalidate: 3600, tags: ["posts"] },
);

export const getSitemapPosts = unstable_cache(
  async (): Promise<{ slug: string; updated_at: string }[]> => {
    const { data } = await supabase()
      .from("posts")
      .select("slug, updated_at")
      .eq("is_published", true);
    return (data as { slug: string; updated_at: string }[]) ?? [];
  },
  ["sitemap-posts"],
  { revalidate: 3600, tags: ["posts"] },
);

// ─── Testimonials ──────────────────────────────────────────

export const getTestimonials = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const { data } = await supabase()
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    return (data as Testimonial[]) ?? [];
  },
  ["testimonials"],
  { revalidate: 3600, tags: ["testimonials"] },
);

// ─── Static params (pour generateStaticParams) ──────────

export const getAllPropertySlugs = unstable_cache(
  async (): Promise<string[]> => {
    const { data } = await supabase()
      .from("properties")
      .select("slug")
      .eq("is_published", true);

    return (data as { slug: string }[] | null)?.map((p) => p.slug) ?? [];
  },
  ["all-property-slugs"],
  { revalidate: 3600, tags: ["properties"] },
);
