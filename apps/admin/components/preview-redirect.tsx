"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirige une ancienne page détail (ex: `/contacts/<id>`) vers la liste avec
 * `?preview=<id>` pour basculer sur la nouvelle UX Dialog. Les anciens liens
 * (emails, favoris, navigation interne) continuent donc de fonctionner.
 */
export function PreviewRedirect({
  basePath,
  id,
}: {
  basePath: string;
  id: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${basePath}?preview=${id}`);
  }, [router, basePath, id]);

  return (
    <div
      className="flex items-center justify-center py-16 text-sm text-muted-foreground"
      aria-live="polite"
    >
      Redirection…
    </div>
  );
}
