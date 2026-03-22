import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { testReports, reportChatMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const [report] = await db
      .select()
      .from(testReports)
      .where(and(eq(testReports.id, id), eq(testReports.userId, user.id)));

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(reportChatMessages)
      .where(eq(reportChatMessages.reportId, id))
      .orderBy(asc(reportChatMessages.createdAt));

    return NextResponse.json({
      id: report.id,
      fileName: report.fileName,
      fileUrl: report.fileUrl,
      mimeType: report.mimeType,
      analysis: report.analysis,
      createdAt: report.createdAt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json({ error: "Failed to load report." }, { status: 500 });
  }
}
