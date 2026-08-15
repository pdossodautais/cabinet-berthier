/**
 * Signatures HMAC pour les liens de désabonnement aux alertes propriétés.
 *
 * Principe : pas de token stocké en DB. On signe (alertId | email) avec un
 * secret côté serveur → l'URL contient (alert, email, sig). Au clic, on
 * revérifie la signature — si elle matche, on désactive l'alerte.
 *
 * Utilise HMAC-SHA256 + timingSafeEqual pour éviter les attaques par
 * comparaison de strings.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s =
    process.env.UNSUB_SECRET ||
    process.env.REVALIDATE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) {
    throw new Error(
      "[alert-tokens] Aucun secret configuré (UNSUB_SECRET / REVALIDATE_SECRET / SUPABASE_SERVICE_ROLE_KEY)",
    );
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret())
    .update(payload)
    .digest("base64url")
    .slice(0, 22); // 132 bits — suffisant + URL courte
}

function verify(payload: string, sig: string): boolean {
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

/** Token pour désactiver UNE alerte spécifique. */
export function signAlert(alertId: string, email: string): string {
  return sign(`alert:${alertId}:${email.toLowerCase()}`);
}

export function verifyAlertSig(
  alertId: string,
  email: string,
  sig: string,
): boolean {
  return verify(`alert:${alertId}:${email.toLowerCase()}`, sig);
}

/** Token pour désactiver TOUTES les alertes d'un email. */
export function signAllForEmail(email: string): string {
  return sign(`all:${email.toLowerCase()}`);
}

export function verifyAllForEmailSig(email: string, sig: string): boolean {
  return verify(`all:${email.toLowerCase()}`, sig);
}

/** Construit les deux URLs absolues à injecter dans l'email. */
export function buildUnsubUrls({
  siteUrl,
  alertId,
  email,
}: {
  siteUrl: string;
  alertId: string;
  email: string;
}): { single: string; all: string } {
  const base = siteUrl.replace(/\/+$/, "");
  const params = (sig: string, path = "") =>
    `?email=${encodeURIComponent(email)}&sig=${sig}${
      path === "single" ? `&alert=${alertId}` : ""
    }`;
  return {
    single: `${base}/alerts/unsubscribe${params(signAlert(alertId, email), "single")}`,
    all: `${base}/alerts/unsubscribe/all${params(signAllForEmail(email))}`,
  };
}
