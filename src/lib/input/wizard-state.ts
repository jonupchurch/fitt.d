import type { JDAnalysis, ResumeAnalysis } from "@/lib/llm/schemas";
import type { JobDescription, Resume } from "./schemas";

const RESUME_KEY = "fittd.resume";
const JOB_DESCRIPTION_KEY = "fittd.jobDescription";
const JD_ANALYSIS_KEY = "fittd.jdAnalysis";
const RESUME_ANALYSIS_KEY = "fittd.resumeAnalysis";

const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

/** Subscribe to changes made via this module's setters. Same-tab only —
 * sessionStorage isn't shared across tabs, so no cross-tab sync is
 * expected or needed. Used by wizard-context.tsx's useSyncExternalStore. */
export function subscribeToWizardState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key);
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
  notifyListeners();
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(key);
  notifyListeners();
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getResumeRaw(): string | null {
  return readRaw(RESUME_KEY);
}

export function getStoredResume(): Resume | null {
  return parseJson<Resume>(getResumeRaw());
}

export function setStoredResume(resume: Resume): void {
  writeJson(RESUME_KEY, resume);
  // A new resume invalidates any analysis computed against the old one.
  removeKey(RESUME_ANALYSIS_KEY);
}

export function getJobDescriptionRaw(): string | null {
  return readRaw(JOB_DESCRIPTION_KEY);
}

export function getStoredJobDescription(): JobDescription | null {
  return parseJson<JobDescription>(getJobDescriptionRaw());
}

export function setStoredJobDescription(jobDescription: JobDescription): void {
  writeJson(JOB_DESCRIPTION_KEY, jobDescription);
  // A new job description invalidates any analysis computed against the
  // old one.
  removeKey(JD_ANALYSIS_KEY);
}

export function getJdAnalysisRaw(): string | null {
  return readRaw(JD_ANALYSIS_KEY);
}

export function getStoredJdAnalysis(): JDAnalysis | null {
  return parseJson<JDAnalysis>(getJdAnalysisRaw());
}

/** Called once analyzeJobDescription (feature 002) succeeds, so
 * feature 004's cross-feature dependency can find it without
 * recomputing — analysis results otherwise only lived in local page
 * state and were lost on navigation. */
export function setStoredJdAnalysis(analysis: JDAnalysis): void {
  writeJson(JD_ANALYSIS_KEY, analysis);
}

export function getResumeAnalysisRaw(): string | null {
  return readRaw(RESUME_ANALYSIS_KEY);
}

export function getStoredResumeAnalysis(): ResumeAnalysis | null {
  return parseJson<ResumeAnalysis>(getResumeAnalysisRaw());
}

/** Called once analyzeResume (feature 003) succeeds — see
 * setStoredJdAnalysis. */
export function setStoredResumeAnalysis(analysis: ResumeAnalysis): void {
  writeJson(RESUME_ANALYSIS_KEY, analysis);
}

/** Clears all wizard state. Not used by feature 001 itself, but kept
 * ready for feature 005's "Try another job" reset. */
export function clearWizardState(): void {
  removeKey(RESUME_KEY);
  removeKey(JOB_DESCRIPTION_KEY);
  removeKey(JD_ANALYSIS_KEY);
  removeKey(RESUME_ANALYSIS_KEY);
}
