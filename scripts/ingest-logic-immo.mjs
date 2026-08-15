// Ingère en bulk les biens d'une agence scrapés depuis Logic-Immo.
// 1. Purge les anciens biens (garde agents/blog/témoignages/settings)
// 2. Pour chaque bien : download photos (filtre le logo agence) → upload Supabase Storage → insert property + media
// 3. Parallélisé par batch de 5 biens
//
// Prérequis :
//   - `.client-config.json` à la racine (lecture du slug et de l'ID Logic-Immo pour info)
//   - `.tmp-logic-immo.json` généré par `/dev-paste.html` depuis le tab Logic-Immo
//   - `.env.local` avec SUPABASE_SERVICE_ROLE_KEY
//
// Usage : node scripts/ingest-logic-immo.mjs
//
// Pour un logo agence qui passe le filtre de taille : ajouter son UUID à
// `LOGO_UUIDS` ci-dessous OU au tableau `brandLogoUuids` dans `.client-config.json`
// (non implémenté — à ajouter si besoin récurrent).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envText = readFileSync("apps/web/.env.local", "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim())),
);
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const clientConfig = JSON.parse(readFileSync(".client-config.json", "utf8"));
console.log(`🏢 Client : ${clientConfig.agencyFullName} (slug: ${clientConfig.slug})`);
if (clientConfig.logicImmoAgencyId) {
  console.log(`🆔 Logic-Immo agency ID : ${clientConfig.logicImmoAgencyId}`);
}

const biens = JSON.parse(readFileSync(".tmp-logic-immo.json", "utf8"));
console.log(`📦 ${biens.length} biens à ingérer`);

// UUIDs de logos agence connus — compléter au fur et à mesure des clients
// si un logo passe le filtre heuristique (taille < 20 KB, carré ~1182×1182).
const LOGO_UUIDS = new Set([
  // ex. "3832e146-966c-4525-bfe1-2ead92b6c132",
]);

const PROPERTY_TYPE_MAP = {
  APARTMENT: "appartement",
  HOUSE: "maison",
  PARKING: "terrain",
  GARAGE: "terrain",
  OFFICE: "bureau",
  COMMERCE: "commerce",
  TRADING: "commerce",
  BUSINESS: "commerce",
  BUILDING: "appartement",
  LAND: "terrain",
  STORAGE_PRODUCTION: "commerce",
};

// ── 1. Purge ──────────────────────────────────────────────
console.log("\n🧹 Purge des anciens biens…");
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
console.log("  ✓ properties + property_media + property_documents vidées");

// Purge du bucket storage (optionnel mais propre — évite l'accumulation)
const { data: folders } = await supabase.storage
  .from("properties")
  .list("", { limit: 1000 });
if (folders && folders.length > 0) {
  // Lister tous les fichiers au 1er niveau (dossiers)
  for (const folder of folders) {
    const { data: files } = await supabase.storage
      .from("properties")
      .list(folder.name, { limit: 200 });
    if (files && files.length > 0) {
      const paths = files.map((f) => `${folder.name}/${f.name}`);
      await supabase.storage.from("properties").remove(paths);
    }
  }
  console.log(`  ✓ bucket storage purgé (${folders.length} dossiers)`);
}

// ── 2. Agents pool (round-robin sur tous les agents actifs) ───
const { data: agents } = await supabase
  .from("agents")
  .select("id")
  .eq("is_active", true)
  .order("created_at", { ascending: true });
const agentPool = (agents ?? []).map((a) => a.id);
console.log(`  ✓ ${agentPool.length} agents actifs`);

// ── 3. Ingest par batch de 5 ──────────────────────────────
const BATCH_SIZE = 5;
const results = [];

async function processOne(b, idx) {
  const slug = `${b.slug}-${b.id.slice(0, 6).toLowerCase()}`;
  const propertyType = PROPERTY_TYPE_MAP[b.property_type_raw] || "appartement";

  const cleanRating = (r) => (r && /^[A-G]$/.test(r) ? r : null);

  // Insert property
  const { data: inserted, error: propErr } = await supabase
    .from("properties")
    .insert({
      title: (b.title || "Bien").trim(),
      slug,
      description: (b.description || "").trim(),
      type: propertyType,
      transaction_type: b.transaction_type || "vente",
      price: b.price || 0,
      surface: b.surface || 0,
      rooms: b.rooms || 1,
      bedrooms: b.bedrooms || 0,
      bathrooms: b.bathrooms || 0,
      address: b.address || "",
      city: b.city || "",
      postal_code: b.zipCode || "",
      latitude: b.latitude || null,
      longitude: b.longitude || null,
      energy_rating: cleanRating(b.energy_rating),
      ghg_rating: cleanRating(b.ghg_rating),
      is_featured: !!b.is_featured,
      is_published: true,
      agent_id: agentPool[idx % agentPool.length] || null,
      features: b.features || [],
      construction_year: b.construction_year || null,
      heating_type: b.heating_type || null,
      energy_sources: b.energy_sources || [],
    })
    .select("id")
    .single();

  if (propErr) {
    return { id: b.id, slug, ok: false, photos: 0, error: propErr.message };
  }

  // Download + upload photos (filtre logo + fichiers < 20KB)
  const filtered = (b.photos || []).filter((url) => {
    const uuid = url.split("/").pop()?.replace(".jpg", "");
    return !!uuid && !LOGO_UUIDS.has(uuid);
  });

  const uploadedRows = [];
  await Promise.all(
    filtered.map(async (photoUrl, pi) => {
      try {
        const fullUrl = photoUrl.startsWith("http") ? photoUrl : `https://${photoUrl}`;
        const res = await fetch(fullUrl);
        if (!res.ok) return;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 20000) return; // filtre petits fichiers (logos)
        const path = `${slug}/${String(pi + 1).padStart(2, "0")}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("properties")
          .upload(path, buf, {
            contentType: "image/jpeg",
            upsert: true,
          });
        if (upErr) return;
        const { data: pub } = supabase.storage
          .from("properties")
          .getPublicUrl(path);
        uploadedRows.push({ pi, url: pub.publicUrl });
      } catch {}
    }),
  );

  // Reorder selon pi, insert media
  uploadedRows.sort((a, b) => a.pi - b.pi);
  if (uploadedRows.length > 0) {
    const rows = uploadedRows.map((r, position) => ({
      property_id: inserted.id,
      url: r.url,
      position,
      alt_text: null,
    }));
    await supabase.from("property_media").insert(rows);
  }

  return {
    id: b.id,
    slug,
    ok: true,
    photos: uploadedRows.length,
    photosRaw: filtered.length,
  };
}

console.log(`\n🏠 Ingestion des biens (batch ${BATCH_SIZE})…`);
const t0 = Date.now();
for (let i = 0; i < biens.length; i += BATCH_SIZE) {
  const slice = biens.slice(i, i + BATCH_SIZE);
  const batchResults = await Promise.all(
    slice.map((b, j) => processOne(b, i + j)),
  );
  batchResults.forEach((r) => {
    const marker = r.ok ? "✓" : "✗";
    const err = r.error ? ` (${r.error.slice(0, 60)})` : "";
    console.log(
      `  ${marker} [${i + batchResults.indexOf(r) + 1}/${biens.length}] ${r.slug} — ${r.photos} photos${err}`,
    );
  });
  results.push(...batchResults);
}

const dt = ((Date.now() - t0) / 1000).toFixed(1);
console.log(
  `\n✅ ${results.filter((r) => r.ok).length}/${biens.length} biens ingérés en ${dt}s`,
);
const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.log(`\n⚠️  ${failed.length} échecs :`);
  failed.forEach((f) =>
    console.log(`   - ${f.slug}: ${f.error?.slice(0, 100)}`),
  );
}

// ── 4. Revalidate le cache Next.js ────────────────────────
try {
  const r = await fetch(
    "http://localhost:3000/api/revalidate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag: "properties",
        paths: ["/biens", "/", "/biens-carte"],
        secret: env.REVALIDATE_SECRET || "dev-revalidation-secret-change-in-production",
      }),
    },
  );
  console.log(`\n🔄 Revalidate: HTTP ${r.status}`);
} catch {
  console.log(`\n⚠️  Revalidate: impossible de joindre le dev server`);
}
