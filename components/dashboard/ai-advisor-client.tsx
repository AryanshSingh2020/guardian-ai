"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import {
  Bot,
  User,
  Upload,
  FileText,
  Loader2,
  Send,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  X,
  Paperclip,
  Sparkles,
  ShieldAlert,
  Info,
  History,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────── */
type ChatMessage = {
  role: "user" | "model";
  content: string;
};

type Finding = {
  test: string;
  value: string;
  normalRange: string;
  status: "normal" | "low" | "high" | "abnormal";
};

type ReportAnalysis = {
  reportType: string;
  summary: string;
  findings: Finding[];
  concerns: string[];
  isReportRelated: boolean;
};

type UploadedFile = {
  url: string;
  name: string;
  mimeType: string;
};

type SavedReport = {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  reportType: string;
  createdAt: string;
};

/* ─── Status badges ──────────────────────────────────────────── */
const statusStyles: Record<Finding["status"], string> = {
  normal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  low: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  abnormal: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/* ─── Suggested questions ────────────────────────────────────── */
const SUGGESTED_QUESTIONS = [
  "What does this report mean in simple terms?",
  "Are there any concerning values I should know about?",
  "Which values are outside the normal range?",
  "What should I discuss with the doctor?",
  "Is my child's health at risk based on this report?",
];

/* ─── Helpers ────────────────────────────────────────────────── */
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── Component ──────────────────────────────────────────────── */
export function AiAdvisorClient() {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* auto-scroll chat */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* Load saved reports list */
  const loadReports = useCallback(async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch("/api/ai-advisor/reports");
      if (res.ok) setSavedReports(await res.json());
    } catch {
      // silently fail
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /* Load a saved report and its chat history */
  const handleSelectReport = async (id: string) => {
    setIsLoadingReport(true);
    try {
      const res = await fetch(`/api/ai-advisor/reports/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFile({ url: data.fileUrl, name: data.fileName, mimeType: data.mimeType });
      setAnalysis(data.analysis);
      setReportId(data.id);
      setMessages(data.messages as ChatMessage[]);
    } catch {
      toast.error("Failed to load report.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  /* UploadThing hook */
  const { startUpload } = useUploadThing("testReport", {
    onUploadProgress: (p) => setUploadProgress(p),
    onClientUploadComplete: (res) => {
      if (!res?.[0]) return;
      const uploaded: UploadedFile = {
        url: res[0].ufsUrl,
        name: res[0].name,
        mimeType: res[0].type ?? "application/pdf",
      };
      setFile(uploaded);
      setIsUploading(false);
      toast.success("Report uploaded. Analyzing…");
      runAnalysis(uploaded);
    },
    onUploadError: () => {
      setIsUploading(false);
      toast.error("Upload failed. Please try again.");
    },
  });

  /* Handle file picker */
  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(picked.type)) {
      toast.error("Only PDF or image files are supported.");
      return;
    }
    if (picked.size > 16 * 1024 * 1024) {
      toast.error("File must be under 16 MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setAnalysis(null);
    setMessages([]);
    setFile(null);
    setReportId(null);

    await startUpload([picked]);
  };

  /* Analyze the report via Gemini */
  const runAnalysis = async (uploaded: UploadedFile) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai-advisor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: uploaded.url,
          mimeType: uploaded.mimeType,
          fileName: uploaded.name,
        }),
      });
      if (!res.ok) throw new Error();
      const data: ReportAnalysis & { reportId: string } = await res.json();
      setAnalysis(data);
      setReportId(data.reportId);

      /* Seed the chat with an opening assistant message */
      const openingMsg = `I've analyzed **${uploaded.name}**.\n\n${data.summary}\n\nFeel free to ask me any questions about the report findings.`;
      setMessages([{ role: "model", content: openingMsg }]);

      /* Refresh the sidebar list */
      loadReports();
    } catch {
      toast.error("Failed to analyze report. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* Send chat message */
  const handleSend = async (message = input.trim()) => {
    if (!message || !file || isChatting) return;

    const userMsg: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsChatting(true);

    try {
      const res = await fetch("/api/ai-advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: file.url,
          mimeType: file.mimeType,
          reportContext: JSON.stringify(analysis),
          history: messages,
          userMessage: message,
          reportId,
        }),
      });
      if (!res.ok) throw new Error();
      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "model", content: reply }]);
    } catch {
      toast.error("Failed to get AI response.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsChatting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  /* Reset to upload new report */
  const handleReset = () => {
    setFile(null);
    setAnalysis(null);
    setMessages([]);
    setInput("");
    setUploadProgress(0);
    setReportId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─── Render: Uploading / Analyzing screen ───────────────────── */
  if (isUploading || isAnalyzing) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-purple-600">
            {isUploading ? (
              <Upload className="h-8 w-8 animate-bounce text-white" />
            ) : (
              <Sparkles className="h-8 w-8 animate-pulse text-white" />
            )}
          </div>
          <div>
            <p className="text-lg font-semibold">
              {isUploading ? "Uploading report…" : "Analyzing with Gemini AI…"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isUploading
                ? "Your file is being securely uploaded."
                : "Reading findings and preparing your advisor session."}
            </p>
          </div>
          {isUploading && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          )}
          {isAnalyzing && (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-violet-500" />
          )}
        </div>
      </div>
    );
  }

  /* ─── Render: Upload screen (no active report) ───────────────── */
  if (!file) {
    return (
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* History sidebar */}
        <div className="hidden w-72 shrink-0 flex-col gap-3 lg:flex">
          <div className="flex items-center gap-2 px-1">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Past Reports</span>
          </div>
          <ScrollArea className="flex-1 rounded-xl border bg-card p-2">
            {isLoadingReports ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : savedReports.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">No reports yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {savedReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectReport(r.id)}
                    disabled={isLoadingReport}
                    className="group flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                      <FileText className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{r.fileName}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Upload area */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <FileText className="h-10 w-10 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">Upload a Test Report</h2>
              <p className="mt-2 text-muted-foreground">
                Upload your child&apos;s lab report, blood test, or any medical
                document and ask the AI anything about it.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-full cursor-pointer rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-10 transition-all hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20 dark:hover:border-violet-600"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 transition-all group-hover:bg-violet-200 dark:bg-violet-900/40">
                  <Upload className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium text-violet-700 dark:text-violet-400">
                    Click to upload or drag & drop
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    PDF, JPG, PNG, WEBP · up to 16 MB
                  </p>
                </div>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,image/*"
              onChange={handleFilePick}
            />

            <div className="rounded-xl border bg-muted/30 p-4 text-left">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                What can the AI help you with?
              </p>
              <ul className="space-y-1.5">
                {[
                  "Explain medical terms in plain language",
                  "Identify values outside the normal range",
                  "Highlight concerns to discuss with your doctor",
                  "Summarize the overall health picture",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              This AI is for informational purposes only. Always consult a
              licensed healthcare provider for medical advice and diagnoses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Render: Main advisor interface ─────────────────────────── */
  return (
    <div className="flex flex-1 gap-4 overflow-hidden">
      {/* ── Left panel: Report analysis ── */}
      <div className="hidden w-80 shrink-0 flex-col gap-3 overflow-y-auto lg:flex">
        {/* File card */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file?.name}</p>
              <p className="text-xs text-muted-foreground">
                {analysis?.reportType || "Report"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleReset}
              title="Upload new report"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Past reports list */}
        {savedReports.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <History className="h-4 w-4 text-violet-500" />
                Past Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <div className="space-y-1">
                {savedReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectReport(r.id)}
                    disabled={isLoadingReport || r.id === reportId}
                    className={cn(
                      "group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60",
                      r.id === reportId && "bg-violet-50 dark:bg-violet-950/20"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{r.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                      </p>
                    </div>
                    {r.id === reportId && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        active
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {analysis && (
          <>
            {/* Summary */}
            <Card>
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-sky-500" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {analysis.summary}
                </p>
              </CardContent>
            </Card>

            {/* Concerns */}
            {analysis.concerns.length > 0 && (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <ul className="space-y-1.5">
                    {analysis.concerns.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Findings table */}
            {analysis.findings.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Test Findings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <div className="space-y-2">
                    {analysis.findings.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-2 rounded-lg border p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{f.test}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.value}
                            {f.normalRange && (
                              <span className="opacity-60">
                                {" "}
                                · ref: {f.normalRange}
                              </span>
                            )}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn("shrink-0 text-xs", statusStyles[f.status])}
                        >
                          {f.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* ── Right panel: Chat ── */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">AI Report Advisor</p>
            <p className="text-xs text-muted-foreground">
              Powered by Gemini · Report-specific answers only
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs"
          >
            <Paperclip className="mr-1.5 h-3.5 w-3.5" />
            New report
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-4">
          {isLoadingReport ? (
            <div className="flex h-full items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {isChatting && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Suggested questions – show only when no user message sent yet */}
          {messages.length <= 1 && analysis && !isLoadingReport && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Suggested questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Disclaimer ribbon */}
        <div className="flex items-center gap-2 border-t bg-amber-50/50 px-4 py-1.5 text-xs text-amber-700 dark:bg-amber-950/10 dark:text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          For informational purposes only — not a substitute for professional
          medical advice.
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 border-t px-4 py-3">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              analysis
                ? "Ask about the report…"
                : "Upload a report to start chatting…"
            }
            disabled={!analysis || isChatting || isLoadingReport}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || !analysis || isChatting || isLoadingReport}
            className="bg-linear-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
          >
            {isChatting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Message bubble ─────────────────────────────────────────── */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-sky-500 text-white"
            : "bg-linear-to-br from-violet-500 to-purple-600 text-white"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-sky-500 text-white"
            : "rounded-tl-sm border bg-muted/50 text-foreground"
        )}
      >
        <FormattedMessage content={message.content} />
      </div>
    </div>
  );
}

/* ─── Simple markdown-like formatting ────────────────────────── */
function FormattedMessage({ content }: { content: string }) {
  const parts = content.split("\n");
  return (
    <>
      {parts.map((line, i) => {
        const formatted = line.split(/(\*\*[^*]+\*\*)/).map((chunk, j) => {
          if (chunk.startsWith("**") && chunk.endsWith("**")) {
            return <strong key={j}>{chunk.slice(2, -2)}</strong>;
          }
          return chunk;
        });
        return (
          <span key={i}>
            {formatted}
            {i < parts.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

/* ─── Typing indicator ───────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-white">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border bg-muted/50 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}
