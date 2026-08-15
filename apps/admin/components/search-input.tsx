"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@repo/ui/input";
import { Search } from "lucide-react";
import { useCallback, useRef } from "react";

export function SearchInput({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("q", value);
        } else {
          params.delete("q");
        }
        params.delete("page");
        router.push(`${basePath}?${params.toString()}`);
      }, 300);
    },
    [router, searchParams, basePath]
  );

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher..."
        defaultValue={searchParams.get("q") || ""}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
