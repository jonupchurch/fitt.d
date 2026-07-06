"use client";

import { useRouter } from "next/navigation";
import { useWizard } from "./wizard-context";

type Checkpoint = {
  label: string;
  done: boolean;
};

/**
 * Sidebar status panel (feature 007) — distinct from wizard-progress.tsx's
 * top nav bar. Each checkpoint tracks something that actually happened,
 * not just navigational position; "fitt.d analysis" specifically means a
 * fit was computed (gapAnalysis persisted, ADR-0010), not merely that
 * both prerequisite analyses exist.
 */
export function WizardStatusPanel() {
  const router = useRouter();
  const {
    resume,
    resumeAnalysis,
    resumeAnalysisFailed,
    jobDescription,
    gapAnalysis,
    resetWizard,
  } = useWizard();

  const checkpoints: Checkpoint[] = [
    { label: "Resume Submitted", done: resume !== null },
    // "Analyzed" means the attempt resolved — succeeded or failed —
    // matching feature 003's navigation-gate semantics (ADR-0009), not
    // that it necessarily succeeded.
    {
      label: "Resume Analyzed",
      done: resumeAnalysis !== null || resumeAnalysisFailed,
    },
    { label: "JD Submitted", done: jobDescription !== null },
    { label: "fitt.d analysis", done: gapAnalysis !== null },
  ];

  function handleReset() {
    const confirmed = window.confirm(
      "Start over? This clears your resume, job description, and all analysis results.",
    );
    if (!confirmed) return;
    resetWizard();
    router.push("/analyze/upload");
  }

  return (
    <aside
      aria-label="Wizard status"
      className="flex w-full flex-none flex-col gap-4 rounded-2xl border border-n-200 bg-white p-5 lg:w-64"
    >
      <p className="text-xs font-semibold tracking-wide text-n-600 uppercase">
        Status
      </p>
      <ul className="flex flex-col gap-3">
        {checkpoints.map((checkpoint) => (
          <li
            key={checkpoint.label}
            className="flex items-center gap-2 text-sm"
          >
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
                checkpoint.done
                  ? "bg-cyan-50 text-brand-strong"
                  : "border border-n-300 text-n-400"
              }`}
            >
              {checkpoint.done ? "✓" : ""}
            </span>
            <span className={checkpoint.done ? "text-ink" : "text-n-600"}>
              {checkpoint.label}
              <span className="sr-only">
                {checkpoint.done ? " — done" : " — not done"}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleReset}
        className="mt-2 rounded-full border border-danger px-4 py-2 text-xs font-semibold text-danger-strong transition-colors hover:bg-red-50"
      >
        Start over
      </button>
    </aside>
  );
}
