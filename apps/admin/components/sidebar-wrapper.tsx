import { createClient } from "@repo/shared/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";

// Mapping titre item navMain → table Supabase à compter (status='nouveau').
// Ajouter une nouvelle entrée ici ajoute automatiquement le badge dans la sidebar.
const NEW_COUNT_TABLES: Record<string, string> = {
  Contacts: "contacts",
  Estimations: "estimations",
  // Futur : Visites: "visit_requests", etc.
};

export async function SidebarWrapper() {
  const supabase = await createClient();
  const currentUser = await getCurrentUser();

  const tableEntries = Object.entries(NEW_COUNT_TABLES);

  const [{ count: propertyCount }, ...newCountResults] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }),
    ...tableEntries.map(([_, table]) =>
      supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("status", "nouveau"),
    ),
  ]);

  const newCounts: Record<string, number> = {};
  tableEntries.forEach(([title, _], i) => {
    newCounts[title] = newCountResults[i]?.count ?? 0;
  });

  return (
    <AppSidebar
      propertyCount={propertyCount ?? 0}
      newCounts={newCounts}
      userRole={currentUser?.role || "admin"}
      userName={
        currentUser?.firstName
          ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
          : undefined
      }
      userEmail={currentUser?.email}
      userAvatar={currentUser?.avatarUrl}
    />
  );
}
