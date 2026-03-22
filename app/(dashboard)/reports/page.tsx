import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, growthRecords, nutritionRecords, healthAssessments, vaccinations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format, differenceInMonths, differenceInYears } from "date-fns";
import {
  FileText,
  Download,
  TrendingUp,
  Apple,
  Brain,
  Syringe,
  Baby,
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
import { Separator } from "@/components/ui/separator";

function getAge(dob: string) {
  const years = differenceInYears(new Date(), new Date(dob));
  const months = differenceInMonths(new Date(), new Date(dob)) % 12;
  if (years === 0) return `${months} months`;
  return `${years}y ${months}m`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const { childId } = await searchParams;
  const user = await requireUser();

  const childrenList = await db
    .select()
    .from(children)
    .where(eq(children.userId, user.id));

  const selectedChildId = childId || childrenList[0]?.id;

  if (!selectedChildId || childrenList.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Health Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive health reports for doctor visits.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No children to report on</h3>
            <p className="text-sm text-muted-foreground">
              Add a child profile first to generate reports.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const child = childrenList.find((c) => c.id === selectedChildId)!;

  const [growth, nutrition, assessments, vax] = await Promise.all([
    db.select().from(growthRecords).where(eq(growthRecords.childId, selectedChildId)).orderBy(desc(growthRecords.date)).limit(20),
    db.select().from(nutritionRecords).where(eq(nutritionRecords.childId, selectedChildId)).orderBy(desc(nutritionRecords.date)).limit(30),
    db.select().from(healthAssessments).where(eq(healthAssessments.childId, selectedChildId)).orderBy(desc(healthAssessments.createdAt)).limit(5),
    db.select().from(vaccinations).where(eq(vaccinations.childId, selectedChildId)),
  ]);

  const latestGrowth = growth[0];
  const latestAssessment = assessments[0];

  const avgCalories =
    nutrition.length > 0
      ? Math.round(
          nutrition.reduce((sum, r) => sum + (r.totalCalories || 0), 0) /
            nutrition.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Health Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive health summary for{" "}
            {child.firstName} {child.lastName}.
          </p>
        </div>
        <div className="flex gap-2">
          {childrenList.length > 1 && (
            <div className="flex gap-1">
              {childrenList.map((c) => (
                <a key={c.id} href={`/reports?childId=${c.id}`}>
                  <Button
                    variant={c.id === selectedChildId ? "default" : "outline"}
                    size="sm"
                  >
                    {c.firstName}
                  </Button>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Content - Printable */}
      <div id="report-content" className="space-y-6">
        {/* Patient Info Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-xl font-bold text-white">
                {child.firstName[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {child.firstName} {child.lastName}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>Age: {getAge(child.dateOfBirth)}</span>
                  <span>DOB: {format(new Date(child.dateOfBirth), "MMM d, yyyy")}</span>
                  <span className="capitalize">Gender: {child.gender}</span>
                  {child.bloodGroup && <span>Blood: {child.bloodGroup}</span>}
                </div>
              </div>
              <Badge className="text-sm">
                Report Date: {format(new Date(), "MMM d, yyyy")}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <h4 className="mb-2 text-sm font-medium">Allergies</h4>
                {(child.allergies as string[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(child.allergies as string[]).map((a) => (
                      <Badge key={a} variant="destructive" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Chronic Conditions</h4>
                {(child.chronicConditions as string[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(child.chronicConditions as string[]).map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Family History</h4>
                {(child.familyMedicalHistory as string[])?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {(child.familyMedicalHistory as string[]).map((h) => (
                      <Badge key={h} variant="outline" className="text-xs">
                        {h}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Summary
            </CardTitle>
            <CardDescription>Latest measurements and trend</CardDescription>
          </CardHeader>
          <CardContent>
            {latestGrowth ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-lg font-bold">
                      {latestGrowth.weightKg ?? "—"} kg
                    </p>
                    <p className="text-xs text-muted-foreground">Weight</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-lg font-bold">
                      {latestGrowth.heightCm ?? "—"} cm
                    </p>
                    <p className="text-xs text-muted-foreground">Height</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-lg font-bold">
                      {latestGrowth.bmi ? latestGrowth.bmi.toFixed(1) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">BMI</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-lg font-bold">
                      {latestGrowth.headCircumferenceCm ?? "—"} cm
                    </p>
                    <p className="text-xs text-muted-foreground">Head Circ.</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 text-sm font-medium">Recent Records</h4>
                  <div className="space-y-1">
                    {growth.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {format(new Date(r.date), "MMM d, yyyy")}
                        </span>
                        <span>
                          {r.weightKg && `${r.weightKg}kg`}
                          {r.weightKg && r.heightCm && " / "}
                          {r.heightCm && `${r.heightCm}cm`}
                          {r.bmi && ` (BMI: ${r.bmi.toFixed(1)})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No growth data recorded.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Nutrition Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Nutrition Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-lg font-bold">{avgCalories || "—"}</p>
                <p className="text-xs text-muted-foreground">Avg Daily Calories</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-lg font-bold">{nutrition.length}</p>
                <p className="text-xs text-muted-foreground">Meals Logged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vaccination Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5" />
              Vaccination Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vax.length > 0 ? (
              <div className="space-y-2">
                {vax.map((v) => (
                  <div key={v.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">{v.vaccineName}</span>
                      {v.doseNumber && (
                        <span className="text-muted-foreground">
                          {" "}
                          (Dose {v.doseNumber})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {v.dateAdministered && (
                        <span className="text-muted-foreground">
                          {format(new Date(v.dateAdministered), "MMM d, yyyy")}
                        </span>
                      )}
                      <Badge
                        variant={v.isCompleted ? "default" : "secondary"}
                        className={`text-xs ${
                          v.isCompleted
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                            : ""
                        }`}
                      >
                        {v.isCompleted ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No vaccination records.
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Assessment */}
        {latestAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Latest AI Assessment
              </CardTitle>
              <CardDescription>
                Generated{" "}
                {format(new Date(latestAssessment.createdAt), "MMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Risk Level:</span>
                <Badge
                  className={
                    latestAssessment.riskLevel === "low"
                      ? "bg-emerald-100 text-emerald-700"
                      : latestAssessment.riskLevel === "moderate"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {latestAssessment.riskLevel}
                </Badge>
              </div>
              <p className="text-sm">{latestAssessment.summary}</p>
              {(latestAssessment.recommendations as string[])?.length > 0 && (
                <div>
                  <h4 className="mb-1 text-sm font-medium">Recommendations:</h4>
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
      </div>
    </div>
  );
}
