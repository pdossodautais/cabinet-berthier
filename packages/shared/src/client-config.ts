/**
 * Source unique de vérité pour les données client-specific (nom, adresse,
 * téléphone, réseaux sociaux, palette brand…).
 *
 * Le fichier `.client-config.json` à la racine du monorepo est lu à la fois
 * par :
 *   - `apps/web` (Server + Client Components via ce module)
 *   - `supabase/seed.mjs` et les scripts Node (via `import * from '...'`)
 *
 * Pour adapter le template à un nouveau client : éditer `.client-config.json`.
 * Le schéma Zod ci-dessous valide le fichier au chargement — si une clé
 * manque ou est incorrecte, une erreur explicite est jetée au démarrage.
 */

import { z } from "zod";
import clientConfigJson from "../../../.client-config.json";

export const clientConfigSchema = z.object({
  $schema: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, {
    message: "slug doit être en kebab-case (minuscules, chiffres, tirets)",
  }),
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
    radius: z.string().regex(/^[\d.]+(px|rem|em)$/, {
      message: "radius doit avoir une unité CSS valide (ex. '0.25rem')",
    }),
    themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
      message: "themeColor doit être un code hex (ex. '#f6f1e7')",
    }),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
      message: "accentColor doit être un code hex",
    }),
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

export type ClientConfig = z.infer<typeof clientConfigSchema>;

// Validation au chargement — erreur explicite si le JSON est invalide.
// En production, ceci fail-fast au démarrage du serveur (avant la première
// requête utilisateur). En dev, Turbopack affichera l'erreur à l'écran.
const parsed = clientConfigSchema.safeParse(clientConfigJson);
if (!parsed.success) {
  const errors = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `[.client-config.json] Configuration invalide :\n${errors}\n\n` +
      `Voir packages/shared/src/client-config.ts pour le schéma attendu.`,
  );
}

export const clientConfig: ClientConfig = parsed.data;

/** Nombre d'années depuis la fondation, calculé à runtime. */
export function yearsOfExperience(refYear = new Date().getFullYear()): number {
  return refYear - clientConfig.foundedYear;
}
