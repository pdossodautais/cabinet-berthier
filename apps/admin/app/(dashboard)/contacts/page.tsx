import { createClient } from "@repo/shared/supabase/server";
import type { ContactWithProperty } from "@repo/shared/supabase/types";

import type { ContactReplyWithAgent } from "@/components/contact-detail-dialog";

import { ContactsTable } from "./contacts-table";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const supabase = await createClient();

  const [{ data: contacts }, { data: replies }] = await Promise.all([
    supabase
      .from("contacts")
      .select("*, properties(title, slug)")
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_replies")
      .select("*, agents(first_name, last_name)")
      .order("created_at", { ascending: true }),
  ]);

  const rows = (contacts as ContactWithProperty[] | null) ?? [];
  const allReplies = (replies as ContactReplyWithAgent[] | null) ?? [];

  // Regroupe les réponses par contact_id pour les passer au Dialog.
  const repliesByContact = new Map<string, ContactReplyWithAgent[]>();
  for (const reply of allReplies) {
    const list = repliesByContact.get(reply.contact_id) ?? [];
    list.push(reply);
    repliesByContact.set(reply.contact_id, list);
  }

  const newCount = rows.filter((c) => c.status === "nouveau").length;

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground text-sm">
          {rows.length} demande{rows.length > 1 ? "s" : ""} reçue
          {rows.length > 1 ? "s" : ""}
          {newCount > 0
            ? ` — ${newCount} non traitée${newCount > 1 ? "s" : ""}`
            : ""}
          .
        </p>
      </div>
      <ContactsTable
        data={rows}
        repliesByContact={Object.fromEntries(repliesByContact)}
      />
    </div>
  );
}
