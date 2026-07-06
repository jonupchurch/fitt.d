import type { ReactNode } from "react";
import { ResumeAnalysisGate } from "./resume-analysis-gate";
import { WizardProvider } from "./wizard-context";
import { WizardProgress } from "./wizard-progress";
import { WizardStatusPanel } from "./wizard-status-panel";

export default function AnalyzeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WizardProvider>
      <ResumeAnalysisGate />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12 lg:flex-row lg:items-start">
        <main className="flex min-w-0 flex-1 flex-col gap-8">
          <WizardProgress />
          {children}
        </main>
        <WizardStatusPanel />
      </div>
    </WizardProvider>
  );
}
