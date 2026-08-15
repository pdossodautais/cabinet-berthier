"use client";

import { Button } from "@repo/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h1 className="text-2xl font-bold tracking-tight mb-2">Une erreur est survenue</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Un problème inattendu s'est produit. Veuillez réessayer.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
