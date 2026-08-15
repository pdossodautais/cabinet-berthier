import type { PropertyType, TransactionType, ContactStatus, EnergyRating, EstimationStatus, AgentRole, DocumentType, NotificationEventType } from "./supabase/types";

// ── Property types ──────────────────────────────────────────────────
export const PROPERTY_TYPES: readonly { value: PropertyType; label: string }[] = [
  { value: "appartement", label: "Appartement" },
  { value: "maison", label: "Maison" },
  { value: "terrain", label: "Terrain" },
  { value: "commerce", label: "Commerce" },
  { value: "bureau", label: "Bureau" },
] as const;

// ── Transaction types ───────────────────────────────────────────────
export const TRANSACTION_TYPES: readonly { value: TransactionType; label: string }[] = [
  { value: "vente", label: "Vente" },
  { value: "location", label: "Location" },
] as const;

// ── Contact statuses ────────────────────────────────────────────────
export const CONTACT_STATUSES: readonly { value: ContactStatus; label: string }[] = [
  { value: "nouveau", label: "Nouveau" },
  { value: "lu", label: "Lu" },
  { value: "traité", label: "Traité" },
  { value: "archivé", label: "Archivé" },
] as const;

// ── Estimation statuses ─────────────────────────────────────────────
export const ESTIMATION_STATUSES: readonly { value: EstimationStatus; label: string }[] = [
  { value: "nouveau", label: "Nouveau" },
  { value: "en_cours", label: "En cours" },
  { value: "terminé", label: "Terminé" },
] as const;

// ── Agent roles ─────────────────────────────────────────────────────
export const AGENT_ROLES: readonly { value: AgentRole; label: string }[] = [
  { value: "admin", label: "Administrateur" },
  { value: "agent", label: "Agent" },
] as const;

// ── Document types ──────────────────────────────────────────────────
export const DOCUMENT_TYPES: readonly { value: DocumentType; label: string }[] = [
  { value: "plan", label: "Plan" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "document", label: "Document" },
] as const;

// ── Rooms filter ────────────────────────────────────────────────────
export const ROOM_OPTIONS: readonly { value: string; label: string }[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5+" },
] as const;

// ── DPE / Energy ratings ────────────────────────────────────────────
export const ENERGY_RATINGS: readonly EnergyRating[] = ["A", "B", "C", "D", "E", "F", "G"];

/** Inline bg + text colors for DPE energy ratings (no Tailwind scan needed) */
export const DPE_COLORS: Record<EnergyRating, { bg: string; text: string }> = {
  A: { bg: "#16a34a", text: "#000" },   // green-600 — dark text for 4.5:1
  B: { bg: "#65a30d", text: "#000" },   // lime-600 — dark text for 4.5:1
  C: { bg: "#ca8a04", text: "#000" },   // yellow-600 — dark text for 4.5:1
  D: { bg: "#d97706", text: "#000" },   // amber-600 — dark text for 4.5:1
  E: { bg: "#ea580c", text: "#000" },   // orange-600 — dark text for 4.5:1
  F: { bg: "#dc2626", text: "#fff" },   // red-600
  G: { bg: "#991b1b", text: "#fff" },   // red-800
};

/** Inline bg + text colors for GES greenhouse gas ratings */
export const GES_COLORS: Record<EnergyRating, { bg: string; text: string }> = {
  A: { bg: "#c4b5fd", text: "#000" },   // violet-300 — dark text for 4.5:1
  B: { bg: "#a78bfa", text: "#000" },   // violet-400 — dark text for 4.5:1
  C: { bg: "#8b5cf6", text: "#fff" },   // violet-500
  D: { bg: "#7c3aed", text: "#fff" },   // violet-600
  E: { bg: "#6d28d9", text: "#fff" },   // violet-700
  F: { bg: "#5b21b6", text: "#fff" },   // violet-800
  G: { bg: "#4c1d95", text: "#fff" },   // violet-900
};

// ── Notification event types ───────────────────────────────────────
export const NOTIFICATION_EVENTS: readonly { value: NotificationEventType; label: string; description: string }[] = [
  { value: "contact", label: "Prise de contact", description: "Recevoir un email à chaque nouveau message de contact" },
  { value: "estimation", label: "Demande d'estimation", description: "Recevoir un email à chaque nouvelle demande d'estimation" },
] as const;
