import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import { getMapProperties } from "@/lib/data";
import { MapSearch } from "@/components/map-search";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rechercher sur la carte",
  description: "Explorez nos biens immobiliers sur une carte interactive. Trouvez la propriété idéale près de chez vous.",
  alternates: { canonical: "/biens/carte" },
  openGraph: {
    title: "Rechercher sur la carte",
    description: "Explorez nos biens immobiliers sur une carte interactive.",
    type: "website",
  },
};

export default async function MapPage() {
  const properties = await getMapProperties();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Rechercher sur la carte
        </h1>
        <Link href="/biens" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Vue liste
        </Link>
      </div>
      <MapSearch properties={properties} />
    </div>
  );
}
