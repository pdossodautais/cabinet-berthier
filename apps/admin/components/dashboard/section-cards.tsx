import { TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

export interface SectionCardData {
  description: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  footer: string;
  footerSub: string;
}

export function SectionCards({ cards }: { cards: SectionCardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => {
        const Icon = card.trend?.direction === "down" ? TrendingDown : TrendingUp;
        return (
          <Card key={card.description} className="@container/card">
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              {card.trend && (
                <CardAction>
                  <Badge variant="outline">
                    <Icon />
                    {card.trend.value}
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.footer} <Icon className="size-4" />
              </div>
              <div className="text-muted-foreground">{card.footerSub}</div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
