import { WifiOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hors ligne",
  description: "Vous êtes actuellement hors ligne. Vérifiez votre connexion internet.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <WifiOff className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Vous êtes hors ligne
      </h1>
      <p className="text-muted-foreground max-w-md">
        Impossible de charger cette page. Vérifiez votre connexion internet et
        réessayez.
      </p>
    </div>
  );
}
