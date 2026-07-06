"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { JobDescription, Resume } from "@/lib/input/schemas";
import {
  clearWizardState,
  getGapAnalysisRaw,
  getJdAnalysisRaw,
  getJobDescriptionRaw,
  getResumeAnalysisRaw,
  getResumeRaw,
  resetForNewJob,
  setStoredGapAnalysis,
  setStoredJdAnalysis,
  setStoredJobDescription,
  setStoredResume,
  setStoredResumeAnalysis,
  subscribeToWizardState,
} from "@/lib/input/wizard-state";
import type { GapAnalysis, JDAnalysis, ResumeAnalysis } from "@/lib/llm/schemas";

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getServerSnapshot(): null {
  return null;
}

type WizardContextValue = {
  resume: Resume | null;
  jobDescription: JobDescription | null;
  jdAnalysis: JDAnalysis | null;
  resumeAnalysis: ResumeAnalysis | null;
  resumeAnalysisFailed: boolean;
  gapAnalysis: GapAnalysis | null;
  setResume: (resume: Resume) => void;
  setJobDescription: (jobDescription: JobDescription) => void;
  setJdAnalysis: (analysis: JDAnalysis) => void;
  setResumeAnalysis: (analysis: ResumeAnalysis) => void;
  setResumeAnalysisFailed: (failed: boolean) => void;
  setGapAnalysis: (analysis: GapAnalysis) => void;
  resetForNewJob: () => void;
  /** Full session reset (feature 007) — clears every wizard-state key.
   * Callers are responsible for navigating afterward (mirrors
   * resetForNewJob, which doesn't navigate either). */
  resetWizard: () => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  // sessionStorage is a browser-only external store — useSyncExternalStore
  // (not useEffect+setState) keeps SSR/hydration consistent: the server
  // snapshot is always null, and the real value is read as soon as the
  // client can, without a synchronous setState-in-effect render cascade.
  const resumeRaw = useSyncExternalStore(
    subscribeToWizardState,
    getResumeRaw,
    getServerSnapshot,
  );
  const jobDescriptionRaw = useSyncExternalStore(
    subscribeToWizardState,
    getJobDescriptionRaw,
    getServerSnapshot,
  );
  const jdAnalysisRaw = useSyncExternalStore(
    subscribeToWizardState,
    getJdAnalysisRaw,
    getServerSnapshot,
  );
  const resumeAnalysisRaw = useSyncExternalStore(
    subscribeToWizardState,
    getResumeAnalysisRaw,
    getServerSnapshot,
  );
  const gapAnalysisRaw = useSyncExternalStore(
    subscribeToWizardState,
    getGapAnalysisRaw,
    getServerSnapshot,
  );

  const resume = useMemo(() => parseJson<Resume>(resumeRaw), [resumeRaw]);
  const jobDescription = useMemo(
    () => parseJson<JobDescription>(jobDescriptionRaw),
    [jobDescriptionRaw],
  );
  const jdAnalysis = useMemo(
    () => parseJson<JDAnalysis>(jdAnalysisRaw),
    [jdAnalysisRaw],
  );
  const resumeAnalysis = useMemo(
    () => parseJson<ResumeAnalysis>(resumeAnalysisRaw),
    [resumeAnalysisRaw],
  );
  const gapAnalysis = useMemo(
    () => parseJson<GapAnalysis>(gapAnalysisRaw),
    [gapAnalysisRaw],
  );

  // Transient (not sessionStorage-backed) — only tracks whether the
  // *current* resume's analysis attempt has failed, so the navigation
  // gate (resume-analysis-gate.tsx) knows to unblock even without a
  // successful ResumeAnalysis. Reset whenever the underlying resume
  // changes, mirroring wizard-state.ts's own invalidation of
  // RESUME_ANALYSIS_KEY on new resume content.
  const [resumeAnalysisFailed, setResumeAnalysisFailed] = useState(false);
  useEffect(() => {
    // setState deferred to a same-tick timeout, not called synchronously
    // in the effect body, to avoid the react-hooks/set-state-in-effect
    // render-cascade lint error — same pattern used by the report page's
    // and job page's analysis effects.
    const timer = setTimeout(() => setResumeAnalysisFailed(false), 0);
    return () => clearTimeout(timer);
  }, [resumeRaw]);

  const value = useMemo<WizardContextValue>(
    () => ({
      resume,
      jobDescription,
      jdAnalysis,
      resumeAnalysis,
      resumeAnalysisFailed,
      gapAnalysis,
      setResume: setStoredResume,
      setJobDescription: setStoredJobDescription,
      setJdAnalysis: setStoredJdAnalysis,
      setResumeAnalysis: setStoredResumeAnalysis,
      setResumeAnalysisFailed,
      setGapAnalysis: setStoredGapAnalysis,
      resetForNewJob,
      resetWizard: clearWizardState,
    }),
    [
      resume,
      jobDescription,
      jdAnalysis,
      resumeAnalysis,
      resumeAnalysisFailed,
      gapAnalysis,
    ],
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within the /analyze layout");
  }
  return ctx;
}
