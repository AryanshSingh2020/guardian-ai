"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  TrendingUp,
  Plus,
  Scale,
  Ruler,
  Activity,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

const chartConfig = {
  weight: { label: "Weight (kg)", color: "hsl(var(--chart-1))" },
  height: { label: "Height (cm)", color: "hsl(var(--chart-2))" },
  bmi: { label: "BMI", color: "hsl(var(--chart-3))" },
  headCircumference: { label: "Head (cm)", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

interface GrowthTrackerProps {
  childrenList: Array<{ id: string; firstName: string; lastName: string | null }>;
  initialRecords: Array<{
    id: string;
    date: string;
    weightKg: number | null;
    heightCm: number | null;
    headCircumferenceCm: number | null;
    bmi: number | null;
    notes: string | null;
  }>;
  selectedChildId?: string;
}

export function GrowthTracker({
  childrenList,
  initialRecords,
  selectedChildId,
}: GrowthTrackerProps) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [childId, setChildId] = useState(selectedChildId || "");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weightKg: "",
    heightCm: "",
    headCircumferenceCm: "",
    notes: "",
  });

  const handleChildChange = (id: string) => {
    setChildId(id);
    router.push(`/growth?childId=${id}`);
    router.refresh();
  };

  const handleSubmit = async () => {
    if (!childId) {
      toast.error("Please select a child");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          date: formData.date,
          weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
          heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
          headCircumferenceCm: formData.headCircumferenceCm
            ? parseFloat(formData.headCircumferenceCm)
            : undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const newRecord = await res.json();
      setRecords([newRecord, ...records]);
      setOpen(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        weightKg: "",
        heightCm: "",
        headCircumferenceCm: "",
        notes: "",
      });
      toast.success("Growth record added");
      router.refresh();
    } catch {
      toast.error("Failed to add growth record");
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...records]
    .reverse()
    .map((r) => ({
      date: format(new Date(r.date), "MMM d"),
      weight: r.weightKg,
      height: r.heightCm,
      bmi: r.bmi,
      headCircumference: r.headCircumferenceCm,
    }));

  const latest = records[0];

  return (
    <div className="space-y-6">
      {/* Child Selector + Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={childId} onValueChange={handleChildChange}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a child" />
          </SelectTrigger>
          <SelectContent>
            {childrenList.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Measurement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Growth Measurement</DialogTitle>
              <DialogDescription>
                Record a new growth measurement for your child.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 12.5"
                    value={formData.weightKg}
                    onChange={(e) =>
                      setFormData({ ...formData, weightKg: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 85.0"
                    value={formData.heightCm}
                    onChange={(e) =>
                      setFormData({ ...formData, heightCm: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Head Circumference (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 47.0"
                  value={formData.headCircumferenceCm}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      headCircumferenceCm: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Optional notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Measurement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Latest Stats */}
      {latest && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Scale className="mx-auto mb-1 h-5 w-5 text-sky-500" />
              <p className="text-xl font-bold">
                {latest.weightKg ? `${latest.weightKg} kg` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Current Weight</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Ruler className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
              <p className="text-xl font-bold">
                {latest.heightCm ? `${latest.heightCm} cm` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Current Height</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="mx-auto mb-1 h-5 w-5 text-violet-500" />
              <p className="text-xl font-bold">
                {latest.bmi ? latest.bmi.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">BMI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-1 h-5 w-5 text-amber-500" />
              <p className="text-xl font-bold">
                {latest.headCircumferenceCm
                  ? `${latest.headCircumferenceCm} cm`
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Head Circ.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 1 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weight Trend</CardTitle>
              <CardDescription>Weight over time (kg)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    fill="var(--color-weight)"
                    fillOpacity={0.2}
                    stroke="var(--color-weight)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Height Trend</CardTitle>
              <CardDescription>Height over time (cm)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="height"
                    fill="var(--color-height)"
                    fillOpacity={0.2}
                    stroke="var(--color-height)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">BMI Trend</CardTitle>
              <CardDescription>Body Mass Index over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="bmi"
                    stroke="var(--color-bmi)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Head Circumference Trend
              </CardTitle>
              <CardDescription>Head circumference over time (cm)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="headCircumference"
                    fill="var(--color-headCircumference)"
                    fillOpacity={0.2}
                    stroke="var(--color-headCircumference)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Growth Records</CardTitle>
          <CardDescription>All recorded measurements</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No growth records yet. Add your first measurement above.
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="text-sm font-medium">
                    {format(new Date(record.date), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {record.weightKg && <span>{record.weightKg} kg</span>}
                    {record.heightCm && <span>{record.heightCm} cm</span>}
                    {record.headCircumferenceCm && (
                      <span>HC: {record.headCircumferenceCm} cm</span>
                    )}
                    {record.bmi && <span>BMI: {record.bmi.toFixed(1)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
