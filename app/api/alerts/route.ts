import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireUser();
    const result = await db
      .select()
      .from(alerts)
      .where(eq(alerts.userId, user.id))
      .orderBy(desc(alerts.createdAt));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { alertId, status } = await req.json();

    const [updated] = await db
      .update(alerts)
      .set({ status })
      .where(eq(alerts.id, alertId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
