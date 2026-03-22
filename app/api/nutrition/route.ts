import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { nutritionRecords, children } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nutritionRecordSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json({ error: "childId required" }, { status: 400 });
    }

    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.userId, user.id)))
      .limit(1);

    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const records = await db
      .select()
      .from(nutritionRecords)
      .where(eq(nutritionRecords.childId, childId))
      .orderBy(desc(nutritionRecords.date));

    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = nutritionRecordSchema.parse(body);

    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, validated.childId), eq(children.userId, user.id)))
      .limit(1);

    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [record] = await db
      .insert(nutritionRecords)
      .values({
        childId: validated.childId,
        date: validated.date,
        mealType: validated.mealType,
        foodItems: validated.foodItems,
        totalCalories: validated.totalCalories,
        protein: validated.protein,
        carbs: validated.carbs,
        fat: validated.fat,
        fiber: validated.fiber,
        waterIntakeMl: validated.waterIntakeMl,
        notes: validated.notes,
      })
      .returning();

    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
