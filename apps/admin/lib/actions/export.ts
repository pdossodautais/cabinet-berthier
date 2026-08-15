"use server";

import { createClient } from "@repo/shared/supabase/server";
import { formatPrice, formatSurface, getPropertyTypeLabel, getTransactionTypeLabel } from "@repo/shared/utils";
import type { ContactWithProperty } from "@repo/shared/supabase/types";

export async function exportContacts(): Promise<{ headers: string[]; rows: string[][] }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*, properties(title)")
    .order("created_at", { ascending: false });

  const headers = ["Nom", "Prénom", "Email", "Téléphone", "Bien concerné", "Message", "Statut", "Date"];
  const rows = (data ?? []).map((c) => [
    c.last_name || "",
    c.first_name || "",
    c.email || "",
    c.phone || "",
    (c as ContactWithProperty).properties?.title || "",
    (c.message || "").replace(/\n/g, " "),
    c.status || "",
    new Date(c.created_at).toLocaleDateString("fr-FR"),
  ]);

  return { headers, rows };
}

export async function exportProperties(): Promise<{ headers: string[]; rows: string[][] }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  const headers = ["Titre", "Type", "Transaction", "Prix", "Surface", "Pièces", "Chambres", "Ville", "Code postal", "DPE", "GES", "Statut", "Vedette", "Date"];
  const rows = (data ?? []).map((p) => [
    p.title || "",
    getPropertyTypeLabel(p.type),
    getTransactionTypeLabel(p.transaction_type),
    formatPrice(p.price),
    formatSurface(p.surface),
    String(p.rooms || ""),
    String(p.bedrooms || ""),
    p.city || "",
    p.postal_code || "",
    p.energy_rating || "",
    p.ghg_rating || "",
    p.is_published ? "Publié" : "Brouillon",
    p.is_featured ? "Oui" : "Non",
    new Date(p.created_at).toLocaleDateString("fr-FR"),
  ]);

  return { headers, rows };
}
