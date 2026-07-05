import type { ReactNode } from "react";
import { WizardProvider } from "./wizard-context";
import { WizardProgress } from "./wizard-progress";

export default function AnalyzeLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WizardProvider>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <WizardProgress />
        {children}
      </main>
    </WizardProvider>
  );
}
