/**
 * Wraps a Supabase/storage error for safe client-side exposure.
 * Logs the full error server-side and returns a generic message
 * to avoid leaking internal details (table names, constraints, etc.).
 */
export function safeError(
  error: { message: string; code?: string },
  context?: string,
): string {
  console.error(`[${context ?? "action"}]`, error.message);
  return "Une erreur est survenue. Veuillez réessayer.";
}
