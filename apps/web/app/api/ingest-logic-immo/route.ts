// Route dev-only pour ingérer en bulk les biens scrapés depuis Logic-Immo.
// Le browser POSTe le JSON des biens ; on télécharge les photos + upload Supabase Storage + UPSERT en DB.
//
// Sécurité :
//  - 403 en production (NODE_ENV === "production")
//  - Header `X-Ingest-Secret` requis, valeur depuis process.env.REVALIDATE_SECRET
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Ingest-Secret",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// UUIDs de logos d'agence connus à filtrer des galeries Logic-Immo
// (ils réapparaissent souvent comme une "fausse" photo dans les médias).
// Compléter cette liste au fil des clients si un nouveau logo passe le
// filtre heuristique de taille.
const KNOWN_LOGO_UUIDS = new Set<string>([
  // "3832e146-966c-4525-bfe1-2ead92b6c132", // exemple
]);

const PROPERTY_TYPE_MAP: Record<string, string> = {
  APARTMENT: "appartement",
  HOUSE: "maison",
  PARKING: "terrain", // on classe les parkings/garages comme "terrain" (pas d'enum dédié)
  OFFICE: "bureau",
  COMMERCE: "commerce",
  BUSINESS: "commerce",
  BUILDING: "appartement",
  LAND: "terrain",
};

type LogicImmoBien = {
  id: string;
  sourceUrl: string;
  title: string;
  slug: string;
  transaction_type: "vente" | "location";
  property_type_raw: string;
  price: number;
  surface: number;
  rooms: number;
  bedrooms: number;
  address: string;
  city: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  energy_rating: string | null;
  is_featured: boolean;
  is_new: boolean;
  description: string;
  features: string[];
  construction_year: number | null;
  heating_type: string | null;
  photos: string[];
};

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Disabled in production" },
      { status: 403, headers: CORS },
    );
  }

  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret || req.headers.get("x-ingest-secret") !== expectedSecret) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403, headers: CORS },
    );
  }

  const biens = (await req.json()) as LogicImmoBien[];
  if (!Array.isArray(biens) || biens.length === 0) {
    return NextResponse.json(
      { error: "No biens" },
      { status: 400, headers: CORS },
    );
  }

  // Audit local (tmpdir portable Windows / Linux / macOS)
  await writeFile(
    join(tmpdir(), "logic-immo-dump.json"),
    JSON.stringify(biens, null, 2),
    "utf8",
  ).catch(() => {});

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // ── 1. Purger l'ancien catalogue de biens (on garde le reste : agents,
  //    blog, témoignages, settings — seuls properties + media + docs sont
  //    recréés depuis le flux Logic-Immo).
  await supabase
    .from("property_media")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("property_documents")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("properties")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  // Dispatcher un agent pour chaque bien (round-robin sur les agents actifs)
  const { data: agents } = await supabase
    .from("agents")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  const agentPool = (agents ?? []).map((a) => a.id);

  // ── 2. Process chaque bien en parallèle (batches de 5 pour éviter de saturer)
  const BATCH = 5;
  const results: Array<{
    id: string;
    slug: string;
    ok: boolean;
    photos: number;
    error?: string;
  }> = [];

  for (let i = 0; i < biens.length; i += BATCH) {
    const slice = biens.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      slice.map(async (b, localIdx) => {
        const idx = i + localIdx;
        try {
          // Slug unique (évite les collisions)
          const slug = `${b.slug}-${b.id.slice(0, 6).toLowerCase()}`;

          // Insert property
          const propertyType =
            PROPERTY_TYPE_MAP[b.property_type_raw] || "appartement";
          const { data: inserted, error: propErr } = await supabase
            .from("properties")
            .insert({
              title: b.title.trim(),
              slug,
              description: (b.description || "").trim(),
              type: propertyType,
              transaction_type: b.transaction_type,
              price: b.price || 0,
              surface: b.surface || 0,
              rooms: b.rooms || 1,
              bedrooms: b.bedrooms || 0,
              bathrooms: 0,
              address: b.address || "",
              city: b.city || "",
              postal_code: b.zipCode || "",
              latitude: b.latitude,
              longitude: b.longitude,
              energy_rating:
                b.energy_rating &&
                /^[A-G]$/.test(b.energy_rating)
                  ? b.energy_rating
                  : null,
              ghg_rating: null,
              is_featured: b.is_featured || idx < 6,
              is_published: true,
              agent_id: agentPool[idx % agentPool.length] || null,
              features: b.features || [],
              construction_year: b.construction_year,
              heating_type: b.heating_type,
            })
            .select("id")
            .single();
          if (propErr) throw new Error("insert: " + propErr.message);

          // Télécharger + uploader les photos (filtrer le logo)
          const filtered = b.photos.filter((url) => {
            const uuid = url.split("/").pop()?.replace(".jpg", "");
            return !!uuid && !KNOWN_LOGO_UUIDS.has(uuid);
          });
          const uploaded: { url: string; alt: string | null }[] = [];
          for (let pi = 0; pi < filtered.length; pi++) {
            const photoUrl = filtered[pi];
            try {
              const res = await fetch(photoUrl);
              if (!res.ok) continue;
              const buf = Buffer.from(await res.arrayBuffer());
              // Filtre aussi par taille : les images < 60KB sont souvent des logos
              if (buf.length < 20000) continue;
              const path = `${slug}/${String(pi + 1).padStart(2, "0")}.jpg`;
              const { error: upErr } = await supabase.storage
                .from("properties")
                .upload(path, buf, {
                  contentType: "image/jpeg",
                  upsert: true,
                });
              if (upErr) continue;
              const { data: pub } = supabase.storage
                .from("properties")
                .getPublicUrl(path);
              uploaded.push({ url: pub.publicUrl, alt: null });
            } catch {}
          }

          // Insert property_media
          if (uploaded.length > 0) {
            const rows = uploaded.map((u, pi) => ({
              property_id: inserted.id,
              url: u.url,
              position: pi,
              alt_text: u.alt,
            }));
            await supabase.from("property_media").insert(rows);
          }

          return {
            id: b.id,
            slug,
            ok: true,
            photos: uploaded.length,
          };
        } catch (e) {
          return {
            id: b.id,
            slug: b.slug,
            ok: false,
            photos: 0,
            error: e instanceof Error ? e.message : String(e),
          };
        }
      }),
    );
    results.push(...batchResults);
  }

  // Invalidate cache
  const revalidate = await fetch(
    `${req.nextUrl.origin}/api/revalidate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag: "properties",
        paths: ["/biens", "/", "/biens-carte"],
        secret:
          process.env.REVALIDATE_SECRET ||
          "dev-revalidation-secret-change-in-production",
      }),
    },
  ).catch(() => null);

  return NextResponse.json(
    {
      total: biens.length,
      ok: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok),
      revalidated: revalidate?.status === 200,
      results,
    },
    { headers: CORS },
  );
}
