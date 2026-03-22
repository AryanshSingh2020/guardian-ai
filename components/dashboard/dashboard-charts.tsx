"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";

const chartConfig = {
  weight: { label: "Weight (kg)", color: "hsl(var(--chart-1))" },
  height: { label: "Height (cm)", color: "hsl(var(--chart-2))" },
  calories: { label: "Calories", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

interface ChildData {
  id: string;
  firstName: string;
  latestGrowth?: {
    weightKg: number | null;
    heightCm: number | null;
    date: string;
  } | null;
  avgCalories: number;
}

export function DashboardCharts({ childrenData }: { childrenData: ChildData[] }) {
  const growthData = childrenData.map((c) => ({
    name: c.firstName,
    weight: c.latestGrowth?.weightKg || 0,
    height: c.latestGrowth?.heightCm || 0,
  }));

  const calorieData = childrenData.map((c) => ({
    name: c.firstName,
    calories: c.avgCalories,
  }));

  if (childrenData.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Growth Overview</CardTitle>
          <CardDescription>Latest weight and height per child</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="weight" fill="var(--color-weight)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="height" fill="var(--color-height)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average Daily Calories</CardTitle>
          <CardDescription>Last 7 days average per child</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={calorieData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="calories" fill="var(--color-calories)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
