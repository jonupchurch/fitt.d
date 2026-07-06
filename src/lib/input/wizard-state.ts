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
  const previous = getStoredResume();
  writeJson(RESUME_KEY, resume);
  // Only invalidate the analysis if the content actually changed —
  // saving the same resume again shouldn't discard a valid analysis.
  if (previous?.rawText !== resume.rawText) {
    removeKey(RESUME_ANALYSIS_KEY);
  }
}

export function getJobDescriptionRaw(): string | null {
  return readRaw(JOB_DESCRIPTION_KEY);
}

export function getStoredJobDescription(): JobDescription | null {
  return parseJson<JobDescription>(getJobDescriptionRaw());
}

export function setStoredJobDescription(jobDescription: JobDescription): void {
  writeJson(JOB_DESCRIPTION_KEY, jobDescription);
  // Deliberately does NOT clear JD_ANALYSIS_KEY here. Unlike Resume
  // (whose analysis only ever gets computed after Resume is saved),
  // the live preview (feature 002) typically computes JDAnalysis from
  // this exact text *before* Continue is ever clicked, independent of
  // submission — there's no reliable "previous text" to compare
  // against (on the very first save, `previous` is null, which would
  // always look "different" and wipe the just-computed analysis out
  // from under feature 004/005's cross-feature dependency on it). The
  // live-preview effect already keeps JDAnalysis in sync with
  // whatever text is currently in the textarea on every debounced
  // change, so it's never genuinely stale by the time this runs.
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

/** Clears all wizard state. Not used by any feature — kept for
 * completeness alongside the more targeted `resetForNewJob` below. */
export function clearWizardState(): void {
  removeKey(RESUME_KEY);
  removeKey(JOB_DESCRIPTION_KEY);
  removeKey(JD_ANALYSIS_KEY);
  removeKey(RESUME_ANALYSIS_KEY);
}

/**
 * "Try another job" (feature 005, spec.md FR-008/FR-009): clears only
 * the job-description-and-beyond state so the candidate can compare
 * against a new job without re-uploading. `Resume`, `ResumeAnalysis`,
 * and `WorkingResumeCopy` (including its applied edits) are left
 * untouched — `GapAnalysis` and not-yet-applied `TailoringOutput`
 * suggestions were never persisted here in the first place (they only
 * ever lived in /analyze/match's local React state), so navigating
 * away already discards them; only the JobDescription/JDAnalysis keys
 * need an explicit clear.
 */
export function resetForNewJob(): void {
  removeKey(JOB_DESCRIPTION_KEY);
  removeKey(JD_ANALYSIS_KEY);
}
