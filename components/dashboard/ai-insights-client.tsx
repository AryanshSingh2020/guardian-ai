"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AiInsightsClientProps {
  childrenList: Array<{ id: string; firstName: string; lastName: string | null }>;
  initialAssessments: Array<{
    id: string;
    assessmentType: string;
    summary: string;
    riskLevel: string | null;
    findings: unknown;
    recommendations: unknown;
    createdAt: Date;
  }>;
  selectedChildId?: string;
}

export function AiInsightsClient({
  childrenList,
  initialAssessments,
  selectedChildId,
}: AiInsightsClientProps) {
  const router = useRouter();
  const [assessments, setAssessments] = useState(initialAssessments);
  const [childId, setChildId] = useState(selectedChildId || "");
  const [loading, setLoading] = useState(false);

  const handleChildChange = (id: string) => {
    setChildId(id);
    router.push(`/ai-insights?childId=${id}`);
    router.refresh();
  };

  const runAssessment = async () => {
    if (!childId) {
      toast.error("Please select a child");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai-assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });

      if (!res.ok) throw new Error("Failed to generate assessment");

      const result = await res.json();
      setAssessments([result, ...assessments]);
      toast.success("AI assessment generated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to generate AI assessment. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const riskConfig = {
    low: {
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    moderate: {
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    high: {
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

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

        <Button
          onClick={runAssessment}
          disabled={loading || !childId}
          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {loading ? "Analyzing..." : "Run AI Assessment"}
        </Button>
      </div>

      {assessments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
              <Brain className="h-8 w-8 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold">No assessments yet</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Run an AI assessment to get personalized health insights for your
              child.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => {
            const risk =
              riskConfig[
                (assessment.riskLevel as keyof typeof riskConfig) || "low"
              ] || riskConfig.low;
            const RiskIcon = risk.icon;
            const findings = (assessment.findings as Array<{
              category: string;
              finding: string;
              severity: string;
            }>) || [];
            const recommendations = (assessment.recommendations as string[]) || [];

            return (
              <Card key={assessment.id} className="overflow-hidden">
                <CardHeader className={risk.bg}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RiskIcon className={`h-6 w-6 ${risk.color}`} />
                      <div>
                        <CardTitle className="text-base">
                          Health Assessment
                        </CardTitle>
                        <CardDescription>
                          {format(
                            new Date(assessment.createdAt),
                            "MMMM d, yyyy 'at' h:mm a"
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={risk.badge}>
                      {assessment.riskLevel} risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {assessment.summary}
                    </p>
                  </div>

                  {findings.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Findings</h4>
                      <div className="space-y-2">
                        {findings.map((finding, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg border p-3"
                          >
                            <Badge variant="outline" className="mt-0.5 text-xs capitalize">
                              {finding.category}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm">{finding.finding}</p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                finding.severity === "normal"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                  : finding.severity === "mild"
                                  ? "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400"
                                  : finding.severity === "moderate"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {finding.severity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {recommendations.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium">
                        Recommendations
                      </h4>
                      <ul className="space-y-1.5">
                        {recommendations.map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
