import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    // Auto-create user on first access
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      })
      .returning();
    return newUser;
  }

  return dbUser;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function getAuthUserId() {
  const { userId } = await auth();
  return userId;
}
