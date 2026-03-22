import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { children } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { childProfileSchema } from "@/lib/validators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const [child] = await db
      .select()
      .from(children)
      .where(and(eq(children.id, id), eq(children.userId, user.id)))
      .limit(1);

    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(child);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const body = await req.json();
    const validated = childProfileSchema.parse(body);

    const [updated] = await db
      .update(children)
      .set({
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
        updatedAt: new Date(),
      })
      .where(and(eq(children.id, id), eq(children.userId, user.id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const [deleted] = await db
      .delete(children)
      .where(and(eq(children.id, id), eq(children.userId, user.id)))
      .returning();

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
