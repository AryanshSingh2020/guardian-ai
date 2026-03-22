import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { testReports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const user = await requireUser();

    const reports = await db
      .select({
        id: testReports.id,
        fileName: testReports.fileName,
        fileUrl: testReports.fileUrl,
        mimeType: testReports.mimeType,
        reportType: testReports.analysis,
        createdAt: testReports.createdAt,
      })
      .from(testReports)
      .where(eq(testReports.userId, user.id))
      .orderBy(desc(testReports.createdAt));

    return NextResponse.json(
      reports.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        fileUrl: r.fileUrl,
        mimeType: r.mimeType,
        reportType: (r.reportType as { reportType?: string } | null)?.reportType ?? "Report",
        createdAt: r.createdAt,
      }))
    );
  } catch (error) {
    console.error("List reports error:", error);
    return NextResponse.json({ error: "Failed to load reports." }, { status: 500 });
  }
}
