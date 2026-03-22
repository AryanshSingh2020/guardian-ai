import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children, growthRecords, nutritionRecords, healthAssessments } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateHealthAssessment } from "@/lib/ai/gemini";
import { differenceInMonths, differenceInYears } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { childId } = await req.json();

    if (!childId) {
      return NextResponse.json({ error: "childId required" }, { status: 400 });
    }

    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.userId, user.id)))
      .limit(1);

    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [growth, nutrition] = await Promise.all([
      db.select().from(growthRecords).where(eq(growthRecords.childId, childId)).orderBy(desc(growthRecords.date)).limit(10),
      db.select().from(nutritionRecords).where(eq(nutritionRecords.childId, childId)).orderBy(desc(nutritionRecords.date)).limit(14),
    ]);

    const birthDate = new Date(child.dateOfBirth);
    const years = differenceInYears(new Date(), birthDate);
    const months = differenceInMonths(new Date(), birthDate) % 12;
    const age = years > 0 ? `${years} years, ${months} months` : `${months} months`;

    const result = await generateHealthAssessment({
      name: `${child.firstName} ${child.lastName || ""}`.trim(),
      age,
      gender: child.gender,
      growthRecords: growth.map((g) => ({
        date: g.date,
        weightKg: g.weightKg,
        heightCm: g.heightCm,
        headCircumferenceCm: g.headCircumferenceCm,
        bmi: g.bmi,
      })),
      nutritionRecords: nutrition.map((n) => ({
        date: n.date,
        mealType: n.mealType,
        totalCalories: n.totalCalories,
        protein: n.protein,
        carbs: n.carbs,
        fat: n.fat,
      })),
      allergies: (child.allergies as string[]) || [],
      chronicConditions: (child.chronicConditions as string[]) || [],
      familyMedicalHistory: (child.familyMedicalHistory as string[]) || [],
    });

    const [assessment] = await db
      .insert(healthAssessments)
      .values({
        childId,
        assessmentType: "comprehensive",
        summary: result.summary,
        riskLevel: result.riskLevel,
        findings: result.findings,
        recommendations: result.recommendations,
        rawResponse: JSON.stringify(result),
      })
      .returning();

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("AI assessment error:", error);
    return NextResponse.json(
      { error: "Failed to generate assessment" },
      { status: 500 }
    );
  }
}
