import { createClient } from "@repo/shared/supabase/server";
import type { Post, Agent } from "@repo/shared/supabase/types";

import { BlogTable } from "./blog-table";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const [{ data: posts }, { data: agents }] = await Promise.all([
    supabase
      .from("posts")
      .select("*, agents(first_name, last_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("agents")
      .select("*")
      .eq("is_active", true)
      .order("last_name"),
  ]);

  const rows =
    (posts as unknown as (Post & {
      agents: Pick<Agent, "first_name" | "last_name"> | null;
    })[]) || [];

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <p className="text-muted-foreground text-sm">
          Gérez vos articles — {rows.length} article{rows.length > 1 ? "s" : ""}.
        </p>
      </div>
      <BlogTable data={rows} agents={(agents as Agent[]) || []} />
    </div>
  );
}
