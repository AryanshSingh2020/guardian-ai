"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Apple,
  Plus,
  Flame,
  Drumstick,
  Wheat,
  Droplets,
  Loader2,
  X,
  Coffee,
  Sun,
  Moon,
  Cookie,
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
import { Badge } from "@/components/ui/badge";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  calories: { label: "Calories", color: "hsl(var(--chart-1))" },
  protein: { label: "Protein (g)", color: "hsl(var(--chart-2))" },
  carbs: { label: "Carbs (g)", color: "hsl(var(--chart-3))" },
  fat: { label: "Fat (g)", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

interface NutritionTrackerProps {
  childrenList: Array<{ id: string; firstName: string; lastName: string | null }>;
  initialRecords: Array<{
    id: string;
    date: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foodItems: unknown;
    totalCalories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
    waterIntakeMl: number | null;
    notes: string | null;
  }>;
  selectedChildId?: string;
}

export function NutritionTracker({
  childrenList,
  initialRecords,
  selectedChildId,
}: NutritionTrackerProps) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [childId, setChildId] = useState(selectedChildId || "");
  const [foodItems, setFoodItems] = useState<
    Array<{ name: string; quantity: string; calories?: number }>
  >([]);
  const [newFood, setNewFood] = useState({ name: "", quantity: "", calories: "" });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    mealType: "breakfast" as "breakfast" | "lunch" | "dinner" | "snack",
    totalCalories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    waterIntakeMl: "",
    notes: "",
  });

  const handleChildChange = (id: string) => {
    setChildId(id);
    router.push(`/nutrition?childId=${id}`);
    router.refresh();
  };

  const addFoodItem = () => {
    if (!newFood.name) return;
    setFoodItems([
      ...foodItems,
      {
        name: newFood.name,
        quantity: newFood.quantity,
        calories: newFood.calories ? parseInt(newFood.calories) : undefined,
      },
    ]);
    setNewFood({ name: "", quantity: "", calories: "" });
  };

  const handleSubmit = async () => {
    if (!childId) {
      toast.error("Please select a child");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          date: formData.date,
          mealType: formData.mealType,
          foodItems,
          totalCalories: formData.totalCalories
            ? parseInt(formData.totalCalories)
            : undefined,
          protein: formData.protein ? parseFloat(formData.protein) : undefined,
          carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
          fat: formData.fat ? parseFloat(formData.fat) : undefined,
          fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
          waterIntakeMl: formData.waterIntakeMl
            ? parseInt(formData.waterIntakeMl)
            : undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const newRecord = await res.json();
      setRecords([newRecord, ...records]);
      setOpen(false);
      setFoodItems([]);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        mealType: "breakfast",
        totalCalories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        waterIntakeMl: "",
        notes: "",
      });
      toast.success("Nutrition record added");
      router.refresh();
    } catch {
      toast.error("Failed to add nutrition record");
    } finally {
      setLoading(false);
    }
  };

  // Aggregate daily data for charts
  const dailyData = records.reduce(
    (acc, r) => {
      const date = r.date;
      if (!acc[date]) {
        acc[date] = { date: format(new Date(date), "MMM d"), calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      acc[date].calories += r.totalCalories || 0;
      acc[date].protein += r.protein || 0;
      acc[date].carbs += r.carbs || 0;
      acc[date].fat += r.fat || 0;
      return acc;
    },
    {} as Record<string, { date: string; calories: number; protein: number; carbs: number; fat: number }>
  );

  const chartData = Object.values(dailyData).reverse().slice(-14);

  // Today's totals
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.date === today);
  const todayCalories = todayRecords.reduce((sum, r) => sum + (r.totalCalories || 0), 0);
  const todayProtein = todayRecords.reduce((sum, r) => sum + (r.protein || 0), 0);
  const todayCarbs = todayRecords.reduce((sum, r) => sum + (r.carbs || 0), 0);
  const todayWater = todayRecords.reduce((sum, r) => sum + (r.waterIntakeMl || 0), 0);

  return (
    <div className="space-y-6">
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
              Log Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Log a Meal</DialogTitle>
              <DialogDescription>
                Record food intake and nutritional information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label>Meal Type</Label>
                  <Select
                    value={formData.mealType}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        mealType: v as typeof formData.mealType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Food Items */}
              <div className="space-y-2">
                <Label>Food Items</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Food name"
                    value={newFood.name}
                    onChange={(e) =>
                      setNewFood({ ...newFood, name: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    placeholder="Qty"
                    value={newFood.quantity}
                    onChange={(e) =>
                      setNewFood({ ...newFood, quantity: e.target.value })
                    }
                    className="w-20"
                  />
                  <Input
                    placeholder="Cal"
                    type="number"
                    value={newFood.calories}
                    onChange={(e) =>
                      setNewFood({ ...newFood, calories: e.target.value })
                    }
                    className="w-20"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addFoodItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {foodItems.map((item, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {item.name} ({item.quantity})
                      {item.calories && ` - ${item.calories}cal`}
                      <button onClick={() => setFoodItems(foodItems.filter((_, idx) => idx !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Calories</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 450"
                    value={formData.totalCalories}
                    onChange={(e) =>
                      setFormData({ ...formData, totalCalories: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 15"
                    value={formData.protein}
                    onChange={(e) =>
                      setFormData({ ...formData, protein: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 50"
                    value={formData.carbs}
                    onChange={(e) =>
                      setFormData({ ...formData, carbs: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 10"
                    value={formData.fat}
                    onChange={(e) =>
                      setFormData({ ...formData, fat: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Water Intake (ml)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 250"
                  value={formData.waterIntakeMl}
                  onChange={(e) =>
                    setFormData({ ...formData, waterIntakeMl: e.target.value })
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
                Log Meal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="mx-auto mb-1 h-5 w-5 text-orange-500" />
            <p className="text-xl font-bold">{todayCalories}</p>
            <p className="text-xs text-muted-foreground">Today&apos;s Calories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Drumstick className="mx-auto mb-1 h-5 w-5 text-red-500" />
            <p className="text-xl font-bold">{todayProtein.toFixed(1)}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Wheat className="mx-auto mb-1 h-5 w-5 text-amber-500" />
            <p className="text-xl font-bold">{todayCarbs.toFixed(1)}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Droplets className="mx-auto mb-1 h-5 w-5 text-sky-500" />
            <p className="text-xl font-bold">{todayWater}ml</p>
            <p className="text-xs text-muted-foreground">Water</p>
          </CardContent>
        </Card>
      </div>

      {/* Calorie Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Calorie Intake</CardTitle>
            <CardDescription>Last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="calories" fill="var(--color-calories)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No meals logged yet. Start tracking nutrition above.
            </p>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 20).map((record) => {
                const MealIcon = mealIcons[record.mealType] || Apple;
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <MealIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {record.mealType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(record.date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {record.totalCalories && (
                        <span>{record.totalCalories} cal</span>
                      )}
                      {record.protein && <span>{record.protein}g P</span>}
                      {record.carbs && <span>{record.carbs}g C</span>}
                      {record.fat && <span>{record.fat}g F</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
