// Identifie + corrige les biens dont `city` est de la forme
// "Paris XXème arrondissement" alors qu'il devrait être "Paris" avec un
// `postal_code` 751XX. Si le postal_code est déjà correct on n'écrit rien.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Lit .env.local à la racine du repo
const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const dryRun = process.argv.includes("--dry-run");

const { data, error } = await supabase
  .from("properties")
  .select("id, slug, city, postal_code");

if (error) {
  console.error(error);
  process.exit(1);
}

const issues = [];
for (const p of data ?? []) {
  const c = (p.city || "").trim();
  if (!/^paris/i.test(c)) continue;
  if (c === "Paris") continue; // déjà clean

  // Extrait le numéro d'arrondissement
  const m = c.match(/(\d{1,2})/);
  if (!m) {
    issues.push({ ...p, action: "skip", reason: "no number found" });
    continue;
  }
  const n = Number(m[1]);
  if (n < 1 || n > 20) {
    issues.push({ ...p, action: "skip", reason: `arr ${n} hors plage` });
    continue;
  }
  const newPostal = `751${String(n).padStart(2, "0")}`;
  const update = { city: "Paris" };
  if (!p.postal_code || !/^750?\d{1,2}$/.test(p.postal_code)) {
    update.postal_code = newPostal;
  }
  issues.push({ ...p, action: "fix", newCity: "Paris", newPostal: update.postal_code, update });
}

console.log(`\nProperties with non-canonical Paris city : ${issues.length}\n`);
for (const i of issues) {
  console.log(
    `  [${i.action}] ${i.id.slice(0, 8)} ${i.slug.padEnd(50, " ")} city="${i.city}" postal=${i.postal_code} → ${i.action === "fix" ? `Paris (${i.newPostal || i.postal_code})` : i.reason}`,
  );
}

if (dryRun) {
  console.log("\n--dry-run : no DB write.");
  process.exit(0);
}

let updated = 0;
for (const i of issues) {
  if (i.action !== "fix") continue;
  const { error: upErr } = await supabase
    .from("properties")
    .update(i.update)
    .eq("id", i.id);
  if (upErr) {
    console.error(`  ! ${i.id} update failed:`, upErr.message);
    continue;
  }
  updated++;
}

console.log(`\n✓ ${updated} bien(s) corrigé(s).`);

// Revalidate /biens et /biens/[slug] côté Next pour voir l'effet
const siteUrl = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const secret = env.REVALIDATION_SECRET;
if (updated > 0 && secret) {
  await Promise.all(
    [
      fetch(`${siteUrl}/api/revalidate?tag=properties&secret=${secret}`).catch(
        () => null,
      ),
      fetch(`${siteUrl}/api/revalidate?tag=home&secret=${secret}`).catch(
        () => null,
      ),
    ],
  );
  console.log("✓ Revalidate triggered.");
}
