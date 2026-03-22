import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { chatAboutReport, type ChatMessage } from "@/lib/ai/report-advisor";
import { db } from "@/lib/db";
import { reportChatMessages } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const { fileUrl, mimeType, reportContext, history, userMessage, reportId } =
      await req.json();

    if (!fileUrl || !mimeType || !userMessage) {
      return NextResponse.json(
        { error: "fileUrl, mimeType, and userMessage are required" },
        { status: 400 }
      );
    }

    const reply = await chatAboutReport({
      fileUrl,
      mimeType,
      reportContext: reportContext || "{}",
      history: (history as ChatMessage[]) || [],
      userMessage,
    });

    // Persist both messages to DB if reportId provided
    if (reportId) {
      await db.insert(reportChatMessages).values([
        { reportId, role: "user", content: userMessage },
        { reportId, role: "model", content: reply },
      ]);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response. Please try again." },
      { status: 500 }
    );
  }
}
