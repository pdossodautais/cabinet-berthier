const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const optionalVars = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes : ${missing.join(", ")}.\n` +
      `Copiez .env.example en .env.local et remplissez les valeurs.`
    );
  }

  const missingOptional = optionalVars.filter((key) => !process.env[key]);
  if (missingOptional.length > 0 && process.env.NODE_ENV === "development") {
    console.warn(
      `[env] Variables optionnelles manquantes : ${missingOptional.join(", ")}`
    );
  }
}
