"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@repo/ui/button";
import { User, Users } from "lucide-react";

interface OwnerFilterProps {
  agentId: string | null;
}

function OwnerFilterInner({ agentId }: OwnerFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMine = searchParams.get("mine") === "1";

  if (!agentId) return null;

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (isMine) {
      params.delete("mine");
    } else {
      params.set("mine", "1");
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Button
      variant={isMine ? "default" : "outline"}
      size="sm"
      onClick={toggle}
    >
      {isMine ? (
        <>
          <User className="mr-2 h-3.5 w-3.5" />
          Mes éléments
        </>
      ) : (
        <>
          <Users className="mr-2 h-3.5 w-3.5" />
          Tout voir
        </>
      )}
    </Button>
  );
}

export function OwnerFilter({ agentId }: OwnerFilterProps) {
  return (
    <Suspense>
      <OwnerFilterInner agentId={agentId} />
    </Suspense>
  );
}
