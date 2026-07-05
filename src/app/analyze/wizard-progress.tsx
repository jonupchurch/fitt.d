"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWizard } from "./wizard-context";

type Step = {
  label: string;
  href: string | null;
  done: boolean;
};

export function WizardProgress() {
  const pathname = usePathname();
  const { resume, jobDescription, jdAnalysis, resumeAnalysis } = useWizard();

  const steps: Step[] = [
    { label: "Upload", href: "/analyze/upload", done: resume !== null },
    // Unlike Upload/Job desc., this step has no input of its own to
    // submit — "done" here means the analysis is available to view
    // (a resume exists), not that the candidate has viewed it yet.
    { label: "Analysis", href: "/analyze/report", done: resume !== null },
    { label: "Job desc.", href: "/analyze/job", done: jobDescription !== null },
    // Same "available, not necessarily viewed" semantic as Analysis —
    // Match depends on both prior analyses existing (spec.md FR-011).
    {
      label: "Match",
      href: "/analyze/match",
      done: jdAnalysis !== null && resumeAnalysis !== null,
    },
  ];

  return (
    <ol aria-label="Progress" className="flex flex-wrap items-center gap-2">
      {steps.map((step, index) => {
        const isCurrent = step.href !== null && pathname === step.href;
        const badgeAndLabel = (
          <>
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
          </>
        );

        return (
          <li key={step.label} className="flex items-center gap-2">
            {step.href ? (
              <Link
                href={step.href}
                className="focus-visible:ring-brand/40 flex items-center gap-2 rounded-full focus-visible:ring-2 focus-visible:outline-none"
              >
                {badgeAndLabel}
              </Link>
            ) : (
              <span className="flex items-center gap-2">{badgeAndLabel}</span>
            )}
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="mx-1 h-px w-6 bg-n-200" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
