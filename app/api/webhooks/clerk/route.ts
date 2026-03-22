import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "user.created" || type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = data;

      const email = email_addresses?.[0]?.email_address || "";

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, id))
        .limit(1);

      if (existingUser) {
        await db
          .update(users)
          .set({
            email,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, id));
      } else {
        await db.insert(users).values({
          clerkId: id,
          email,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        });
      }
    }

    if (type === "user.deleted") {
      const { id } = data;
      await db.delete(users).where(eq(users.clerkId, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
