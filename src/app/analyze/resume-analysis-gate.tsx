"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWizard } from "./wizard-context";

const GATED_PATHS = new Set(["/analyze/job", "/analyze/match"]);

/**
 * Enforces spec.md FR-011 (amended, ADR-0009) for navigation paths
 * wizard-progress.tsx's disabled links don't cover: typed URLs,
 * back/forward, and stale bookmarks. Renders nothing — mounted once in
 * the /analyze layout alongside WizardProgress.
 */
export function ResumeAnalysisGate() {
  const pathname = usePathname();
  const router = useRouter();
  const { resume, resumeAnalysis, resumeAnalysisFailed } = useWizard();

  const resumeAnalysisPending =
    resume !== null && resumeAnalysis === null && !resumeAnalysisFailed;

  useEffect(() => {
    if (resumeAnalysisPending && GATED_PATHS.has(pathname)) {
      router.replace("/analyze/report");
    }
  }, [resumeAnalysisPending, pathname, router]);

  return null;
}
