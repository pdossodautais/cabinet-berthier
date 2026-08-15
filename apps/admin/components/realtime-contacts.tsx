"use client";

import { useEffect } from "react";
import { createClient } from "@repo/shared/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RealtimeContacts() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-contacts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contacts" },
        (payload) => {
          const c = payload.new as { first_name?: string; last_name?: string };
          toast.info(`Nouveau contact : ${c.first_name || ""} ${c.last_name || ""}`, {
            action: {
              label: "Voir",
              onClick: () => router.push("/contacts"),
            },
          });
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
