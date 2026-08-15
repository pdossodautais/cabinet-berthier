"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChartData {
  contactsByMonth: { month: string; count: number }[];
  propertiesByType: { type: string; count: number }[];
}

export function DashboardCharts({ data }: { data: ChartData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Contacts par mois (6 derniers mois) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contacts par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.contactsByMonth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  allowDecimals={false}
                  fontSize={12}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Contacts"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Biens par type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Biens par type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.propertiesByType} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  fontSize={12}
                  tick={{ fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  width={100}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 12,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Biens"
                  fill="var(--primary)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
