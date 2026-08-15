/** Helpers de formatage partagés par les templates email (pas d'import UI). */

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatSurface(n: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(n)} m²`;
}
