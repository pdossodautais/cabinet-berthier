"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui/toggle-group";

export interface ChartPoint {
  date: string;
  contacts: number;
  estimations: number;
}

const chartConfig = {
  activity: {
    label: "Activité",
  },
  contacts: {
    label: "Contacts",
    color: "var(--primary)",
  },
  estimations: {
    label: "Estimations",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const TIME_RANGE_LABELS: Record<string, string> = {
  "90d": "3 mois",
  "30d": "30 jours",
  "7d": "7 jours",
};

export function ChartAreaInteractive({ data }: { data: ChartPoint[] }) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filtered = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter((p) => new Date(p.date) >= cutoff);
  }, [data, timeRange]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Activité</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Contacts et estimations sur la période
          </span>
          <span className="@[540px]/card:hidden">Activité récente</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            value={[timeRange]}
            onValueChange={(v) => v[0] && setTimeRange(v[0])}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 mois</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 jours</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 jours</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
          >
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Période"
            >
              <SelectValue placeholder="3 mois">
                {TIME_RANGE_LABELS[timeRange] ?? "3 mois"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                3 mois
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 jours
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 jours
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filtered}>
            <defs>
              <linearGradient id="fillContacts" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-contacts)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-contacts)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillEstimations" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-estimations)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-estimations)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value as string).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="estimations"
              type="natural"
              fill="url(#fillEstimations)"
              stroke="var(--color-estimations)"
              stackId="a"
            />
            <Area
              dataKey="contacts"
              type="natural"
              fill="url(#fillContacts)"
              stroke="var(--color-contacts)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
