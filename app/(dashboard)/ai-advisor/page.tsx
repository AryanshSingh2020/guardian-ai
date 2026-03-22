import { AiAdvisorClient } from "@/components/dashboard/ai-advisor-client";

export default function AiAdvisorPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Report Advisor</h1>
        <p className="text-muted-foreground">
          Upload your child&apos;s medical test report and ask the AI any
          questions about it.
        </p>
      </div>
      <AiAdvisorClient />
    </div>
  );
}
