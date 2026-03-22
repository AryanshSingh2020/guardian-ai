import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type ChatMessage = {
  role: "user" | "model";
  content: string;
};

/**
 * Fetches the file from URL and converts to a Gemini-compatible Part.
 */
async function urlToGenerativePart(url: string, mimeType: string) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return { inlineData: { data: base64, mimeType } };
}

/**
 * First call: analyze the report and return a structured summary.
 */
export async function analyzeReport(fileUrl: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const filePart = await urlToGenerativePart(fileUrl, mimeType);

  const prompt = `You are a pediatric health AI advisor. You have been given a child's medical test report.

Carefully analyze the report and extract:
1. Report type (blood test, urine test, X-ray, ultrasound, etc.)
2. Key findings and values
3. Any abnormal or concerning values
4. Overall health indication from the report

Return your analysis as JSON:
{
  "reportType": "...",
  "summary": "2-3 sentence plain-language summary for a parent",
  "findings": [{ "test": "...", "value": "...", "normalRange": "...", "status": "normal|low|high|abnormal" }],
  "concerns": ["list of concerning findings, or empty array"],
  "isReportRelated": true
}

Only return valid JSON.`;

  const result = await model.generateContent([prompt, filePart]);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse report analysis");
  return JSON.parse(jsonMatch[0]);
}

/**
 * Chat with Gemini about the uploaded report.
 * Strictly refuses non-report questions.
 */
export async function chatAboutReport({
  fileUrl,
  mimeType,
  reportContext,
  history,
  userMessage,
}: {
  fileUrl: string;
  mimeType: string;
  reportContext: string; // JSON stringified analysis from analyzeReport()
  history: ChatMessage[];
  userMessage: string;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const filePart = await urlToGenerativePart(fileUrl, mimeType);

  const systemPrompt = `You are a pediatric health AI advisor. A parent has uploaded their child's medical test report for your analysis.

STRICT RULES you must follow:
1. You ONLY answer questions that are directly related to the uploaded test report.
2. If the user asks anything that is NOT related to the report (e.g., general knowledge, unrelated health advice, cooking, weather, etc.), respond with: "I can only answer questions about the uploaded test report. Please ask something related to the report findings."
3. You are NOT a general-purpose assistant. Your sole purpose in this session is to help the parent understand the test report.
4. Keep answers clear, compassionate, and understandable for a non-medical parent.
5. Never provide a definitive diagnosis — always recommend consulting a healthcare provider for medical decisions.

Report Context (already analyzed):
${reportContext}

Previous conversation:
${history.map((m) => `${m.role === "user" ? "Parent" : "AI"}: ${m.content}`).join("\n")}`;

  const result = await model.generateContent([
    systemPrompt,
    filePart,
    `Parent's question: ${userMessage}`,
  ]);

  return result.response.text();
}
