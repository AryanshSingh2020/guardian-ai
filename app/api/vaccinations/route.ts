import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { vaccinations, children } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { vaccinationSchema } from "@/lib/validators";

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
      .from(vaccinations)
      .where(eq(vaccinations.childId, childId))
      .orderBy(desc(vaccinations.createdAt));

    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = vaccinationSchema.parse(body);

    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, validated.childId), eq(children.userId, user.id)))
      .limit(1);

    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [record] = await db
      .insert(vaccinations)
      .values({
        childId: validated.childId,
        vaccineName: validated.vaccineName,
        dateAdministered: validated.dateAdministered,
        dueDate: validated.dueDate,
        doseNumber: validated.doseNumber,
        provider: validated.provider,
        isCompleted: validated.isCompleted,
        notes: validated.notes,
      })
      .returning();

    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
