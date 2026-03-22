import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, growthRecords, nutritionRecords, healthAssessments, alerts, appointments } from "@/lib/db/schema";
import { eq, desc, and, gte, count } from "drizzle-orm";
import { subDays, format } from "date-fns";
import {
  Baby,
  TrendingUp,
  Apple,
  Brain,
  Bell,
  CalendarDays,
  Plus,
  ArrowRight,
  Activity,
  Heart,
  Scale,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

export default async function DashboardPage() {
  const user = await requireUser();

  const [childrenList, recentAlerts, upcomingAppointments] = await Promise.all([
    db.select().from(children).where(eq(children.userId, user.id)),
    db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, user.id))
      .orderBy(desc(alerts.createdAt))
      .limit(5),
    db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.userId, user.id),
          eq(appointments.isCompleted, false)
        )
      )
      .orderBy(appointments.dateTime)
      .limit(5),
  ]);

  // Get latest growth and nutrition for each child
  const childrenWithData = await Promise.all(
    childrenList.map(async (child) => {
      const [latestGrowth] = await db
        .select()
        .from(growthRecords)
        .where(eq(growthRecords.childId, child.id))
        .orderBy(desc(growthRecords.date))
        .limit(1);

      const [latestAssessment] = await db
        .select()
        .from(healthAssessments)
        .where(eq(healthAssessments.childId, child.id))
        .orderBy(desc(healthAssessments.createdAt))
        .limit(1);

      const recentNutrition = await db
        .select()
        .from(nutritionRecords)
        .where(eq(nutritionRecords.childId, child.id))
        .orderBy(desc(nutritionRecords.date))
        .limit(7);

      const avgCalories =
        recentNutrition.length > 0
          ? Math.round(
              recentNutrition.reduce((sum, r) => sum + (r.totalCalories || 0), 0) /
                recentNutrition.length
            )
          : 0;

      return {
        ...child,
        latestGrowth,
        latestAssessment,
        avgCalories,
      };
    })
  );

  const totalChildren = childrenList.length;
  const pendingAlerts = recentAlerts.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.firstName || "there"}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your children&apos;s health status.
          </p>
        </div>
        <Link href="/children/new">
          <Button className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-600 hover:to-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Children</p>
                <p className="text-3xl font-bold">{totalChildren}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30">
                <Baby className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Alerts</p>
                <p className="text-3xl font-bold">{pendingAlerts}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                <Bell className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Assessments</p>
                <p className="text-3xl font-bold">
                  {childrenWithData.filter((c) => c.latestAssessment).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                <Brain className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalChildren === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
              <Baby className="h-8 w-8 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold">No children added yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first child profile to start tracking their health.
            </p>
            <Link href="/children/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Child Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Children Health Cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            {childrenWithData.map((child) => (
              <Card key={child.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-bold text-white">
                        {child.firstName[0]}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {child.firstName} {child.lastName}
                        </CardTitle>
                        <CardDescription>
                          Born {format(new Date(child.dateOfBirth), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                    </div>
                    {child.latestAssessment && (
                      <Badge
                        variant={
                          child.latestAssessment.riskLevel === "low"
                            ? "default"
                            : child.latestAssessment.riskLevel === "moderate"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          child.latestAssessment.riskLevel === "low"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : ""
                        }
                      >
                        {child.latestAssessment.riskLevel} risk
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <Scale className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">
                        {child.latestGrowth?.weightKg
                          ? `${child.latestGrowth.weightKg} kg`
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Weight</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <Ruler className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">
                        {child.latestGrowth?.heightCm
                          ? `${child.latestGrowth.heightCm} cm`
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Height</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <Apple className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold">
                        {child.avgCalories > 0 ? `${child.avgCalories}` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Cal</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/children/${child.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Link href={`/growth?childId=${child.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Growth
                      </Button>
                    </Link>
                    <Link href={`/ai-insights?childId=${child.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        AI Assess
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <DashboardCharts childrenData={childrenWithData} />
        </>
      )}

      {/* Bottom Grid: Alerts + Appointments */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Alerts</CardTitle>
              <CardDescription>Latest notifications</CardDescription>
            </div>
            <Link href="/alerts">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No alerts yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.message.substring(0, 80)}...
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Upcoming Appointments</CardTitle>
              <CardDescription>Scheduled visits</CardDescription>
            </div>
            <Link href="/appointments">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {appt.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appt.dateTime), "MMM d, yyyy 'at' h:mm a")}
                        {appt.doctorName && ` • Dr. ${appt.doctorName}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
