import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { analyzeReport } from "@/lib/ai/report-advisor";
import { db } from "@/lib/db";
import { testReports, reportChatMessages } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { fileUrl, mimeType, fileName } = await req.json();

    if (!fileUrl || !mimeType) {
      return NextResponse.json(
        { error: "fileUrl and mimeType are required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeReport(fileUrl, mimeType);

    // Save report + analysis to DB
    const [savedReport] = await db
      .insert(testReports)
      .values({
        userId: user.id,
        fileName: fileName || "report",
        fileUrl,
        mimeType,
        analysis,
      })
      .returning();

    // Save opening assistant message
    const openingMessage = `I've analyzed **${fileName || "your report"}**.\n\n${analysis.summary}\n\nFeel free to ask me any questions about the report findings.`;
    await db.insert(reportChatMessages).values({
      reportId: savedReport.id,
      role: "model",
      content: openingMessage,
    });

    return NextResponse.json({ ...analysis, reportId: savedReport.id });
  } catch (error) {
    console.error("Report analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze report. Please try again." },
      { status: 500 }
    );
  }
}
