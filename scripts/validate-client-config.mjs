// Valide `.client-config.json` via le schéma Zod défini dans
// `packages/shared/src/client-config.ts`. Utilisé par la CI et en local :
//   node scripts/validate-client-config.mjs
//
// Sort avec code 0 si OK, 1 sinon (pour `&& deploy`).
import { readFileSync } from "node:fs";
import { z } from "zod";

const config = JSON.parse(readFileSync(".client-config.json", "utf8"));

// Schéma dupliqué pour éviter de compiler TS depuis un script mjs ;
// en cas de divergence, la vérité reste `packages/shared/src/client-config.ts`.
const schema = z.object({
  $schema: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  agencyName: z.string().min(1),
  agencyFullName: z.string().min(1),
  agencyShortName: z.string().min(1),
  city: z.string().min(1),
  region: z.string().min(1),
  tagline: z.string().min(1),
  logoSubtitle: z.string().min(1),
  logoAlt: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  primaryDomain: z.string().min(1),
  foundedYear: z.number().int().min(1900).max(2100),
  contact: z.object({
    phone: z.string().min(1),
    phoneSecondary: z.string().optional(),
    email: z.string().email(),
    address: z.string().min(1),
    addressShort: z.string().min(1),
    mapsUrl: z.string().url(),
    hours: z.string().min(1),
  }),
  secondaryOffice: z
    .object({
      name: z.string().min(1),
      address: z.string().min(1),
      since: z.number().int().min(1900).max(2100),
    })
    .optional(),
  social: z.object({
    instagram: z.string(),
    facebook: z.string(),
    linkedin: z.string(),
    twitter: z.string(),
  }),
  brand: z.object({
    hue: z.number().min(0).max(360),
    chroma: z.number().min(0).max(0.4),
    radius: z.string().regex(/^[\d.]+(px|rem|em)$/),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }),
  reviews: z.object({
    url: z.string().url(),
    rating: z.number().min(0).max(5),
    count: z.number().int().min(0),
  }),
  logicImmoAgencyId: z.string().optional(),
  ogImage: z.object({
    alt: z.string().min(1),
    tagline: z.string().min(1),
    footerLeft: z.string().min(1),
    footerRight: z.string().min(1),
  }),
});

const parsed = schema.safeParse(config);
if (!parsed.success) {
  console.error("❌ .client-config.json invalide :\n");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".") || "(racine)"}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(`✓ .client-config.json valide — ${parsed.data.agencyFullName} (${parsed.data.slug})`);
