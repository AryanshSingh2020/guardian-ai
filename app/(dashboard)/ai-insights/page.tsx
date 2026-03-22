import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, healthAssessments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AiInsightsClient } from "@/components/dashboard/ai-insights-client";

export default async function AiInsightsPage({
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

  let assessments: (typeof healthAssessments.$inferSelect)[] = [];
  if (selectedChildId) {
    assessments = await db
      .select()
      .from(healthAssessments)
      .where(eq(healthAssessments.childId, selectedChildId))
      .orderBy(desc(healthAssessments.createdAt))
      .limit(10);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Health Insights</h1>
        <p className="text-muted-foreground">
          AI-powered health assessments and personalized recommendations.
        </p>
      </div>

      <AiInsightsClient
        childrenList={childrenList}
        initialAssessments={assessments}
        selectedChildId={selectedChildId}
      />
    </div>
  );
}
