import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, nutritionRecords } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NutritionTracker } from "@/components/nutrition/nutrition-tracker";

export default async function NutritionPage({
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

  let records: (typeof nutritionRecords.$inferSelect)[] = [];
  const selectedChildId = childId || childrenList[0]?.id;

  if (selectedChildId) {
    records = await db
      .select()
      .from(nutritionRecords)
      .where(eq(nutritionRecords.childId, selectedChildId))
      .orderBy(desc(nutritionRecords.date));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nutrition Tracking
        </h1>
        <p className="text-muted-foreground">
          Log meals, track calories, and monitor nutritional intake.
        </p>
      </div>

      <NutritionTracker
        childrenList={childrenList}
        initialRecords={records}
        selectedChildId={selectedChildId}
      />
    </div>
  );
}
