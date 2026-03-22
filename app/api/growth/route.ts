import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { growthRecords, children } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { growthRecordSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json({ error: "childId required" }, { status: 400 });
    }

    // Verify child belongs to user
    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.userId, user.id)))
      .limit(1);

    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const records = await db
      .select()
      .from(growthRecords)
      .where(eq(growthRecords.childId, childId))
      .orderBy(desc(growthRecords.date));

    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = growthRecordSchema.parse(body);

    // Verify child belongs to user
    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, validated.childId), eq(children.userId, user.id)))
      .limit(1);

    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Calculate BMI if weight and height provided
    let bmi: number | undefined;
    if (validated.weightKg && validated.heightCm) {
      const heightM = validated.heightCm / 100;
      bmi = parseFloat((validated.weightKg / (heightM * heightM)).toFixed(1));
    }

    const [record] = await db
      .insert(growthRecords)
      .values({
        childId: validated.childId,
        date: validated.date,
        weightKg: validated.weightKg,
        heightCm: validated.heightCm,
        headCircumferenceCm: validated.headCircumferenceCm,
        bmi,
        notes: validated.notes,
      })
      .returning();

    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
