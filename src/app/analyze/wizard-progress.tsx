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
  const { resume, jobDescription, jdAnalysis, resumeAnalysis, resumeAnalysisFailed } =
    useWizard();

  // Per ADR-0009 / spec.md FR-011 (amended): while a resume exists but
  // its analysis has neither succeeded nor failed yet, Job desc. and
  // Match are unreachable — rendered as inert (no href) rather than
  // linked. resume-analysis-gate.tsx enforces the same rule for direct
  // navigation (typed URLs, back/forward).
  const resumeAnalysisPending =
    resume !== null && resumeAnalysis === null && !resumeAnalysisFailed;

  const steps: Step[] = [
    { label: "Upload", href: "/analyze/upload", done: resume !== null },
    // Unlike Upload/Job desc., this step has no input of its own to
    // submit — "done" means the analysis has actually resolved, not
    // just that a resume exists to analyze.
    {
      label: "Resume analyzed",
      href: "/analyze/report",
      done: resumeAnalysis !== null,
    },
    {
      label: "Job desc.",
      href: resumeAnalysisPending ? null : "/analyze/job",
      done: jobDescription !== null,
    },
    // "done" here means both analyses are ready to compare, not that
    // the candidate has actually opened/viewed the fitt.d match yet.
    {
      label: "fitt.d",
      href: resumeAnalysisPending ? null : "/analyze/match",
      done: jdAnalysis !== null && resumeAnalysis !== null,
    },
  ];

  return (
    <ol
      aria-label="Progress"
      className="flex flex-wrap items-center gap-2 print:hidden"
    >
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
