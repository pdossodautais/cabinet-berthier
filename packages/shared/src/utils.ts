import { PROPERTY_TYPES, TRANSACTION_TYPES, CONTACT_STATUSES, ESTIMATION_STATUSES, AGENT_ROLES, DOCUMENT_TYPES } from "./constants";

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1).replace(".", ",")} M\u20AC`;
  if (price >= 1_000) return `${Math.round(price / 1_000)} k\u20AC`;
  return `${price} \u20AC`;
}

export function formatSurface(surface: number): string {
  return `${surface} m\u00B2`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function findLabel(list: readonly { value: string; label: string }[], value: string): string {
  return list.find((item) => item.value === value)?.label || value;
}

export function getPropertyTypeLabel(type: string): string {
  return findLabel(PROPERTY_TYPES, type);
}

export function getTransactionTypeLabel(type: string): string {
  return findLabel(TRANSACTION_TYPES, type);
}

export function getContactStatusLabel(status: string): string {
  return findLabel(CONTACT_STATUSES, status);
}

export function getEstimationStatusLabel(status: string): string {
  return findLabel(ESTIMATION_STATUSES, status);
}

export function getAgentRoleLabel(role: string): string {
  return findLabel(AGENT_ROLES, role);
}

export function getDocumentTypeLabel(type: string): string {
  return findLabel(DOCUMENT_TYPES, type);
}

/**
 * Sanitize user input for use in PostgREST .or() filter strings.
 * Strips characters that have special meaning in the filter syntax
 * (commas, dots, parentheses) to prevent filter injection.
 */
export function sanitizeFilterValue(value: string): string {
  return value.replace(/[,.()*\\]/g, "");
}
