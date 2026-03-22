import { NextRequest, NextResponse } from "next/server";
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
import { format, differenceInMonths, differenceInYears } from "date-fns";

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

    const [growth, nutrition, assessments, vax] = await Promise.all([
      db
        .select()
        .from(growthRecords)
        .where(eq(growthRecords.childId, childId))
        .orderBy(desc(growthRecords.date))
        .limit(20),
      db
        .select()
        .from(nutritionRecords)
        .where(eq(nutritionRecords.childId, childId))
        .orderBy(desc(nutritionRecords.date))
        .limit(30),
      db
        .select()
        .from(healthAssessments)
        .where(eq(healthAssessments.childId, childId))
        .orderBy(desc(healthAssessments.createdAt))
        .limit(5),
      db
        .select()
        .from(vaccinations)
        .where(eq(vaccinations.childId, childId)),
    ]);

    const years = differenceInYears(new Date(), new Date(child.dateOfBirth));
    const months = differenceInMonths(new Date(), new Date(child.dateOfBirth)) % 12;

    return NextResponse.json({
      child: {
        ...child,
        age: years > 0 ? `${years} years, ${months} months` : `${months} months`,
      },
      growthRecords: growth,
      nutritionRecords: nutrition,
      healthAssessments: assessments,
      vaccinations: vax,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
