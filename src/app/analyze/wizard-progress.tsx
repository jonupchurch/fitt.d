"use client";

import { usePathname } from "next/navigation";
import { useWizard } from "./wizard-context";

type Step = {
  label: string;
  href: string | null;
  done: boolean;
};

export function WizardProgress() {
  const pathname = usePathname();
  const { resume, jobDescription } = useWizard();

  const steps: Step[] = [
    { label: "Upload", href: "/analyze/upload", done: resume !== null },
    // "Analysis" and "Match" arrive with features 003/004 — shown as
    // upcoming steps so the full flow is legible from the start.
    { label: "Analysis", href: null, done: false },
    { label: "Job desc.", href: "/analyze/job", done: jobDescription !== null },
    { label: "Match", href: null, done: false },
  ];

  return (
    <ol aria-label="Progress" className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const isCurrent = step.href !== null && pathname === step.href;
        return (
          <li key={step.label} className="flex items-center gap-2">
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={
                "flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs font-semibold " +
                (step.done
                  ? "border-brand-strong bg-brand-strong text-white"
                  : isCurrent
                    ? "border-brand text-brand-strong"
                    : "border-n-300 text-n-600")
              }
            >
              {step.done ? "✓" : index + 1}
            </span>
            <span
              className={`text-sm ${step.done || isCurrent ? "text-ink" : "text-n-600"}`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="mx-1 h-px w-6 bg-n-200" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
