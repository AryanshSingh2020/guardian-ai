import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { childProfileSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const result = await db
      .select()
      .from(children)
      .where(eq(children.userId, user.id));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = childProfileSchema.parse(body);

    const [child] = await db
      .insert(children)
      .values({
        userId: user.id,
        firstName: validated.firstName,
        lastName: validated.lastName,
        dateOfBirth: validated.dateOfBirth,
        gender: validated.gender,
        bloodGroup: validated.bloodGroup,
        photoUrl: validated.photoUrl,
        allergies: validated.allergies,
        chronicConditions: validated.chronicConditions,
        familyMedicalHistory: validated.familyMedicalHistory,
        notes: validated.notes,
      })
      .returning();

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
