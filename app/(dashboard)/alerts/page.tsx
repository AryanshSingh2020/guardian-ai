import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { alerts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AlertsClient } from "@/components/alerts/alerts-client";

export default async function AlertsPage() {
  const user = await requireUser();

  const alertsList = await db
    .select()
    .from(alerts)
    .where(eq(alerts.userId, user.id))
    .orderBy(desc(alerts.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h1>
        <p className="text-muted-foreground">
          View vaccination reminders, medication alerts, and health notifications.
        </p>
      </div>

      <AlertsClient initialAlerts={alertsList} />
    </div>
  );
}
