"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Bell,
  Syringe,
  Pill,
  TrendingUp,
  CalendarDays,
  Brain,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const alertIcons = {
  vaccination: Syringe,
  medication: Pill,
  growth_anomaly: TrendingUp,
  appointment: CalendarDays,
  ai_summary: Brain,
};

const alertColors = {
  vaccination: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  medication: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  growth_anomaly: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  appointment: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  ai_summary: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
};

interface AlertsClientProps {
  initialAlerts: Array<{
    id: string;
    type: "vaccination" | "medication" | "growth_anomaly" | "appointment" | "ai_summary";
    title: string;
    message: string;
    status: "pending" | "sent" | "read" | "dismissed";
    createdAt: Date;
    sentAt: Date | null;
  }>;
}

export function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alertsList, setAlertsList] = useState(initialAlerts);

  const updateStatus = async (alertId: string, status: string) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, status }),
      });

      if (!res.ok) throw new Error();

      setAlertsList(
        alertsList.map((a) =>
          a.id === alertId ? { ...a, status: status as typeof a.status } : a
        )
      );
      toast.success(`Alert marked as ${status}`);
    } catch {
      toast.error("Failed to update alert");
    }
  };

  const pending = alertsList.filter((a) => a.status === "pending" || a.status === "sent");
  const read = alertsList.filter((a) => a.status === "read");
  const dismissed = alertsList.filter((a) => a.status === "dismissed");

  const renderAlerts = (
    alerts: typeof alertsList,
    showActions: boolean = true
  ) => {
    if (alerts.length === 0) {
      return (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No alerts in this category.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type] || Bell;
          const colorClass = alertColors[alert.type] || "";

          return (
            <Card key={alert.id}>
              <CardContent className="flex items-start gap-4 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {alert.type.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(alert.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                {showActions && alert.status !== "dismissed" && (
                  <div className="flex gap-1">
                    {alert.status !== "read" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateStatus(alert.id, "read")}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateStatus(alert.id, "dismissed")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Tabs defaultValue="active" className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">
          Active
          {pending.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pending.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="read">Read</TabsTrigger>
        <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>

      <TabsContent value="active">{renderAlerts(pending)}</TabsContent>
      <TabsContent value="read">{renderAlerts(read, false)}</TabsContent>
      <TabsContent value="dismissed">{renderAlerts(dismissed, false)}</TabsContent>
      <TabsContent value="all">{renderAlerts(alertsList)}</TabsContent>
    </Tabs>
  );
}
