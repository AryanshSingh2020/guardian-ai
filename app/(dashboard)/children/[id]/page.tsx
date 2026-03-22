import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  children,
  growthRecords,
  nutritionRecords,
  healthAssessments,
  vaccinations,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format, differenceInMonths, differenceInYears } from "date-fns";
import Link from "next/link";
import {
  Baby,
  Calendar,
  Droplets,
  AlertCircle,
  TrendingUp,
  Apple,
  Brain,
  Syringe,
  Edit,
  Scale,
  Ruler,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteChildButton } from "@/components/children/delete-child-button";

function getAge(dob: string) {
  const birthDate = new Date(dob);
  const years = differenceInYears(new Date(), birthDate);
  const months = differenceInMonths(new Date(), birthDate) % 12;
  if (years === 0) return `${months} months old`;
  return `${years} years, ${months} months old`;
}

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, id), eq(children.userId, user.id)))
    .limit(1);

  if (!child) notFound();

  const [growth, nutrition, assessments, vax] = await Promise.all([
    db
      .select()
      .from(growthRecords)
      .where(eq(growthRecords.childId, id))
      .orderBy(desc(growthRecords.date))
      .limit(10),
    db
      .select()
      .from(nutritionRecords)
      .where(eq(nutritionRecords.childId, id))
      .orderBy(desc(nutritionRecords.date))
      .limit(10),
    db
      .select()
      .from(healthAssessments)
      .where(eq(healthAssessments.childId, id))
      .orderBy(desc(healthAssessments.createdAt))
      .limit(5),
    db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.childId, id))
      .orderBy(desc(vaccinations.createdAt)),
  ]);

  const latestGrowth = growth[0];
  const latestAssessment = assessments[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={child.photoUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-sky-400 to-indigo-500 text-xl font-bold text-white">
              {child.firstName[0]}
              {child.lastName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {child.firstName} {child.lastName}
            </h1>
            <p className="text-muted-foreground">{getAge(child.dateOfBirth)}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {child.gender}
              </Badge>
              {child.bloodGroup && (
                <Badge variant="outline">
                  <Droplets className="mr-1 h-3 w-3" />
                  {child.bloodGroup}
                </Badge>
              )}
              {latestAssessment && (
                <Badge
                  className={
                    latestAssessment.riskLevel === "low"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : latestAssessment.riskLevel === "moderate"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }
                >
                  {latestAssessment.riskLevel} risk
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/ai-insights?childId=${child.id}`}>
            <Button variant="outline">
              <Brain className="mr-2 h-4 w-4" />
              AI Assessment
            </Button>
          </Link>
          <DeleteChildButton childId={child.id} childName={child.firstName} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Scale className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-bold">
              {latestGrowth?.weightKg ? `${latestGrowth.weightKg} kg` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Weight</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Ruler className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-bold">
              {latestGrowth?.heightCm ? `${latestGrowth.heightCm} cm` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Height</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-bold">
              {latestGrowth?.bmi ? latestGrowth.bmi.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">BMI</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Syringe className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-bold">
              {vax.filter((v) => v.isCompleted).length}/{vax.length}
            </p>
            <p className="text-xs text-muted-foreground">Vaccinations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
          <TabsTrigger value="growth">Growth History</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {latestAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4" />
                  Latest AI Assessment
                </CardTitle>
                <CardDescription>
                  {format(new Date(latestAssessment.createdAt), "MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{latestAssessment.summary}</p>
                {(latestAssessment.recommendations as string[])?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium">Recommendations:</p>
                    <ul className="space-y-1">
                      {(latestAssessment.recommendations as string[]).map(
                        (rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                            {rec}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href={`/growth?childId=${child.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Log Growth
                  </Button>
                </Link>
                <Link href={`/nutrition?childId=${child.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Apple className="mr-2 h-4 w-4" />
                    Log Meal
                  </Button>
                </Link>
                <Link href={`/ai-insights?childId=${child.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="mr-2 h-4 w-4" />
                    AI Analysis
                  </Button>
                </Link>
                <Link href={`/reports?childId=${child.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    View Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {child.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{child.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(child.allergies as string[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(child.allergies as string[]).map((a) => (
                      <Badge
                        key={a}
                        variant="secondary"
                        className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      >
                        {a}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No known allergies
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chronic Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                {(child.chronicConditions as string[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(child.chronicConditions as string[]).map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No chronic conditions
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Family Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(child.familyMedicalHistory as string[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(child.familyMedicalHistory as string[]).map((h) => (
                      <Badge key={h} variant="outline">
                        {h}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No family history recorded
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Growth Records</CardTitle>
              <CardDescription>Last 10 measurements</CardDescription>
            </CardHeader>
            <CardContent>
              {growth.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No growth records yet.{" "}
                  <Link
                    href={`/growth?childId=${child.id}`}
                    className="text-sky-600 underline"
                  >
                    Add one now
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {growth.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="text-sm font-medium">
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {record.weightKg && (
                          <span>{record.weightKg} kg</span>
                        )}
                        {record.heightCm && (
                          <span>{record.heightCm} cm</span>
                        )}
                        {record.bmi && <span>BMI: {record.bmi.toFixed(1)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vaccination Records</CardTitle>
            </CardHeader>
            <CardContent>
              {vax.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No vaccination records yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {vax.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{v.vaccineName}</p>
                        {v.doseNumber && (
                          <p className="text-xs text-muted-foreground">
                            Dose {v.doseNumber}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {v.dateAdministered && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(v.dateAdministered), "MMM d, yyyy")}
                          </span>
                        )}
                        <Badge
                          variant={v.isCompleted ? "default" : "secondary"}
                          className={
                            v.isCompleted
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : ""
                          }
                        >
                          {v.isCompleted ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
