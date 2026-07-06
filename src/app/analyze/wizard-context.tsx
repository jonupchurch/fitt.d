"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { JobDescription, Resume } from "@/lib/input/schemas";
import {
  getJdAnalysisRaw,
  getJobDescriptionRaw,
  getResumeAnalysisRaw,
  getResumeRaw,
  resetForNewJob,
  setStoredJdAnalysis,
  setStoredJobDescription,
  setStoredResume,
  setStoredResumeAnalysis,
  subscribeToWizardState,
} from "@/lib/input/wizard-state";
import type { JDAnalysis, ResumeAnalysis } from "@/lib/llm/schemas";

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
  setResume: (resume: Resume) => void;
  setJobDescription: (jobDescription: JobDescription) => void;
  setJdAnalysis: (analysis: JDAnalysis) => void;
  setResumeAnalysis: (analysis: ResumeAnalysis) => void;
  resetForNewJob: () => void;
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

  const value = useMemo<WizardContextValue>(
    () => ({
      resume,
      jobDescription,
      jdAnalysis,
      resumeAnalysis,
      setResume: setStoredResume,
      setJobDescription: setStoredJobDescription,
      setJdAnalysis: setStoredJdAnalysis,
      setResumeAnalysis: setStoredResumeAnalysis,
      resetForNewJob,
    }),
    [resume, jobDescription, jdAnalysis, resumeAnalysis],
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
