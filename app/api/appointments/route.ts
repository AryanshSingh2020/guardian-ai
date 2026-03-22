import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { appointmentSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, user.id))
      .orderBy(desc(appointments.dateTime));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const validated = appointmentSchema.parse(body);

    const [appt] = await db
      .insert(appointments)
      .values({
        userId: user.id,
        childId: validated.childId,
        title: validated.title,
        description: validated.description,
        doctorName: validated.doctorName,
        location: validated.location,
        dateTime: new Date(validated.dateTime),
        notes: validated.notes,
      })
      .returning();

    return NextResponse.json(appt, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
