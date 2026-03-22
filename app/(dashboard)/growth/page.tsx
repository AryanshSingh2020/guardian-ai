import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, growthRecords } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { GrowthTracker } from "@/components/growth/growth-tracker";

export default async function GrowthPage({
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

  let records: (typeof growthRecords.$inferSelect)[] = [];
  const selectedChildId = childId || childrenList[0]?.id;

  if (selectedChildId) {
    records = await db
      .select()
      .from(growthRecords)
      .where(eq(growthRecords.childId, selectedChildId))
      .orderBy(desc(growthRecords.date));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Growth Tracking</h1>
        <p className="text-muted-foreground">
          Monitor weight, height, and BMI with WHO standards comparison.
        </p>
      </div>

      <GrowthTracker
        childrenList={childrenList}
        initialRecords={records}
        selectedChildId={selectedChildId}
      />
    </div>
  );
}
