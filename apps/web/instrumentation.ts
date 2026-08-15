export async function register() {
  const { validateEnv } = await import("@repo/shared/env");
  validateEnv();
}
