// Upsert les settings agence depuis `.client-config.json` vers la table `settings`.
// Appelé par `/seed-client` ou manuellement : `node supabase/seed-settings.mjs`
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envText = readFileSync("apps/web/.env.local", "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim())),
);
const s = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const c = JSON.parse(readFileSync(".client-config.json", "utf8"));

const rows = [
  ["agency_name", c.agencyFullName],
  ["agency_description", c.description],
  ["agency_email", c.contact.email],
  ["agency_phone", c.contact.phone],
  ["agency_phone_secondary", c.contact.phoneSecondary ?? ""],
  ["agency_address", c.contact.address],
  ["agency_maps_url", c.contact.mapsUrl],
  ["agency_hours", c.contact.hours],
  ["social_instagram", c.social.instagram],
  ["social_facebook", c.social.facebook],
  ["social_linkedin", c.social.linkedin],
  ["social_twitter", c.social.twitter],
  ["google_reviews_url", c.reviews.url],
  ["agency_rating", String(c.reviews.rating)],
  ["agency_reviews_count", String(c.reviews.count)],
  ["about_title", c.tagline],
  ["about_description", c.description],
];

console.log(`🏢 ${c.agencyFullName} — upsert ${rows.length} settings`);

for (const [key, value] of rows) {
  const { error } = await s
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) console.error(`  ✗ ${key}:`, error.message);
}

console.log(`✓ done`);
