import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@repo/shared/supabase/server";
import type {
  ContactWithProperty,
  Property,
  PropertyMedia,
} from "@repo/shared/supabase/types";
import {
  formatPrice,
  getContactStatusLabel,
} from "@repo/shared/utils";

import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Avatar, AvatarFallback } from "@repo/ui/avatar";
import { PropertyImage } from "@repo/ui/property-image";
import { buttonVariants } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";

import {
  SectionCards,
  type SectionCardData,
} from "@/components/dashboard/section-cards";
import {
  ChartAreaInteractive,
  type ChartPoint,
} from "@/components/dashboard/chart-area-interactive";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [
    { count: totalProperties },
    { count: publishedProperties },
    { count: featuredProperties },
    { count: newContacts },
    { count: contactsLast30 },
    { count: contactsPrev30 },
    { count: estimationsLast30 },
    { count: estimationsPrev30 },
    { data: recentContacts },
    { data: recentProperties },
    { data: chartContacts },
    { data: chartEstimations },
  ] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("status", "nouveau"),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo.toISOString())
      .lt("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("estimations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("estimations")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sixtyDaysAgo.toISOString())
      .lt("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("contacts")
      .select("*, properties(title)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("properties")
      .select("*, property_media(url, position)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contacts")
      .select("created_at")
      .gte("created_at", ninetyDaysAgo.toISOString()),
    supabase
      .from("estimations")
      .select("created_at")
      .gte("created_at", ninetyDaysAgo.toISOString()),
  ]);

  // Agrège par jour pour le graphique activité
  const byDay = new Map<
    string,
    { contacts: number; estimations: number }
  >();
  for (let i = 0; i <= 90; i++) {
    const d = new Date(ninetyDaysAgo);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), { contacts: 0, estimations: 0 });
  }
  for (const c of chartContacts ?? []) {
    const key = (c.created_at as string).slice(0, 10);
    const entry = byDay.get(key);
    if (entry) entry.contacts += 1;
  }
  for (const e of chartEstimations ?? []) {
    const key = (e.created_at as string).slice(0, 10);
    const entry = byDay.get(key);
    if (entry) entry.estimations += 1;
  }
  const chartData: ChartPoint[] = [...byDay.entries()].map(([date, v]) => ({
    date,
    ...v,
  }));

  // Calcul des tendances (30j vs 30j précédents)
  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? "+100%" : "—";
    const delta = ((curr - prev) / prev) * 100;
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}%`;
  };
  const contactsTrend: "up" | "down" =
    (contactsLast30 ?? 0) >= (contactsPrev30 ?? 0) ? "up" : "down";
  const estimationsTrend: "up" | "down" =
    (estimationsLast30 ?? 0) >= (estimationsPrev30 ?? 0) ? "up" : "down";

  const publishedPct =
    (totalProperties ?? 0) > 0
      ? Math.round(
          ((publishedProperties ?? 0) / (totalProperties ?? 1)) * 100,
        )
      : 0;

  const cards: SectionCardData[] = [
    {
      description: "Biens au total",
      value: totalProperties ?? 0,
      trend: {
        direction: "up",
        value: `${publishedPct}% publiés`,
      },
      footer: `${publishedProperties ?? 0} biens visibles`,
      footerSub: `${featuredProperties ?? 0} mis en vedette`,
    },
    {
      description: "Nouveaux contacts",
      value: newContacts ?? 0,
      footer: "En attente de réponse",
      footerSub: "Traiter rapidement pour ne rien perdre",
    },
    {
      description: "Contacts (30 j)",
      value: contactsLast30 ?? 0,
      trend: {
        direction: contactsTrend,
        value: pct(contactsLast30 ?? 0, contactsPrev30 ?? 0),
      },
      footer:
        contactsTrend === "up" ? "En progression" : "En recul",
      footerSub: `${contactsPrev30 ?? 0} sur la période précédente`,
    },
    {
      description: "Estimations (30 j)",
      value: estimationsLast30 ?? 0,
      trend: {
        direction: estimationsTrend,
        value: pct(estimationsLast30 ?? 0, estimationsPrev30 ?? 0),
      },
      footer:
        estimationsTrend === "up" ? "En progression" : "En recul",
      footerSub: `${estimationsPrev30 ?? 0} sur la période précédente`,
    },
  ];

  const statusVariant: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    nouveau: "destructive",
    lu: "default",
    traité: "secondary",
    archivé: "outline",
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
      <SectionCards cards={cards} />

      <div className="px-4 lg:px-6">
        <ChartAreaInteractive data={chartData} />
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-7 lg:gap-6 lg:px-6">
        {/* Derniers contacts */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Derniers contacts</CardTitle>
              <CardDescription>Demandes reçues récemment</CardDescription>
            </div>
            <Link
              href="/contacts"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Voir tout
              <ArrowUpRight className="ml-1 size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentContacts && recentContacts.length > 0 ? (
              <div className="space-y-2">
                {recentContacts.map((contact: ContactWithProperty) => (
                  <Link
                    key={contact.id}
                    href={`/contacts/${contact.id}`}
                    className="flex items-center gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {contact.first_name[0]}
                        {contact.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {contact.first_name} {contact.last_name}
                        </p>
                        <Badge
                          variant={statusVariant[contact.status] || "outline"}
                          className="text-[10px] px-1.5 h-5"
                        >
                          {getContactStatusLabel(contact.status)}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {contact.message}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {new Date(contact.created_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun contact pour le moment.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Biens récents */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Biens récents</CardTitle>
              <CardDescription>Derniers ajouts au catalogue</CardDescription>
            </div>
            <Link
              href="/biens"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Voir tout
              <ArrowUpRight className="ml-1 size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentProperties && recentProperties.length > 0 ? (
              <div className="space-y-2">
                {recentProperties.map(
                  (property: Property & {
                    property_media: Pick<
                      PropertyMedia,
                      "url" | "position"
                    >[];
                  }) => {
                    const firstImage = property.property_media
                      ?.sort((a, b) => a.position - b.position)[0]
                      ?.url;
                    return (
                      <Link
                        key={property.id}
                        href={`/biens/${property.id}`}
                        className="flex items-center gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                          <PropertyImage
                            src={firstImage || ""}
                            alt={property.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {property.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {property.city}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatPrice(property.price)}
                        </p>
                      </Link>
                    );
                  },
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aucun bien ajouté.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
