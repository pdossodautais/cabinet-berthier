/**
 * Validation des variables d'environnement requises.
 * Appelé une seule fois dans le root layout côté serveur.
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optional = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_PLAUSIBLE_DOMAIN",
  "REVALIDATION_SECRET",
] as const;

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes :\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCréez un fichier .env.local à la racine du monorepo.`,
    );
  }

  if (!process.env.REVALIDATION_SECRET) {
    console.warn(
      "[env] REVALIDATION_SECRET non défini — l'API de revalidation sera désactivée.",
    );
  }
}
