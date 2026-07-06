"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ResumeAnalysis } from "@/lib/llm/schemas";
import { useWizard } from "../wizard-context";
import { analyzeResume } from "./actions";

const SECTION_LABELS: Record<string, string> = {
  contact: "Contact",
  summary: "Summary",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
};

const STATUS_LABELS: Record<string, string> = {
  strong: "Strong",
  "needs-work": "Needs work",
  review: "Review",
  "not-found": "Not found",
};

const LOADING_MESSAGES = [
  "Reading your resume…",
  "Parsing sections…",
  "Checking ATS compatibility…",
  "Weighing strengths and weaknesses…",
  "Drafting rewrite suggestions…",
  "Tallying your score…",
  "Polishing the details…",
];
const LOADING_MESSAGE_INTERVAL_MS = 2200;

/** Cycles through LOADING_MESSAGES while `active`, so a long-running
 * analysis call (up to ~60s) reads as actively working rather than
 * stuck on a static skeleton. */
function useLoadingMessage(active: boolean): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, LOADING_MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [active]);

  return LOADING_MESSAGES[index];
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Needs work";
  return "Needs major improvement";
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative flex h-36 w-36 flex-none items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-n-200"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand-strong"
        />
      </svg>
      <div aria-hidden="true" className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-extrabold text-ink">
          {score}
        </span>
        <span className="text-xs text-n-600">/ 100</span>
      </div>
      <span className="sr-only">
        Resume score: {score} out of 100 — {scoreLabel(score)}
      </span>
    </div>
  );
}

function AtsChecklist({ checks }: { checks: ResumeAnalysis["atsChecks"] }) {
  return (
    <ul className="flex flex-col gap-2">
      {checks.map((check) => (
        <li key={check.id} className="flex items-start gap-2 text-sm">
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
              check.passed
                ? "bg-cyan-50 text-brand-strong"
                : "bg-red-50 text-danger-strong"
            }`}
          >
            {check.passed ? "✓" : "✗"}
          </span>
          <span>
            <span className="font-medium text-ink">
              {check.passed ? "Passed: " : "Needs attention: "}
            </span>
            <span className="text-n-700">{check.label}</span>
            {check.detail ? (
              <span className="block text-n-600">{check.detail}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function SectionFeedbackList({
  feedback,
}: {
  feedback: ResumeAnalysis["sectionFeedback"];
}) {
  return (
    <div className="flex flex-col divide-y divide-n-200 rounded-xl border border-n-200 bg-white">
      {feedback.map((item) => (
        <details key={item.section} className="p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <span className="font-medium text-ink">
              {SECTION_LABELS[item.section] ?? item.section}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.status === "strong"
                  ? "bg-cyan-50 text-brand-strong"
                  : item.status === "not-found"
                    ? "bg-n-100 text-n-700"
                    : "border border-warning-strong text-warning-strong"
              }`}
            >
              {STATUS_LABELS[item.status] ?? item.status}
            </span>
          </summary>
          <p className="mt-2 text-sm text-n-600">{item.note}</p>
        </details>
      ))}
    </div>
  );
}

function StrengthsWeaknesses({
  strengths,
  weaknesses,
}: {
  strengths: string[];
  weaknesses: string[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
          Strengths
        </p>
        <ul className="flex flex-col gap-1 text-sm text-ink">
          {strengths.map((strength) => (
            <li key={strength}>+ {strength}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
          Weaknesses
        </p>
        <ul className="flex flex-col gap-1 text-sm text-ink">
          {weaknesses.map((weakness) => (
            <li key={weakness}>− {weakness}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RewriteSuggestions({
  suggestions,
}: {
  suggestions: ResumeAnalysis["rewriteSuggestions"];
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {suggestions.map((suggestion, index) => (
        <div
          key={`${suggestion.section}-${index}`}
          className="rounded-xl border border-n-200 bg-white p-4"
        >
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            {SECTION_LABELS[suggestion.section] ?? suggestion.section}
          </p>
          <p className="text-sm text-n-600">
            <span className="font-medium text-ink">Before: </span>
            {suggestion.original}
          </p>
          <p className="mt-1 text-sm text-ink">
            <span className="font-medium">After: </span>
            {suggestion.suggested}
          </p>
          <p className="mt-2 text-xs text-n-600">{suggestion.whyStronger}</p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(suggestion.suggested);
              setCopiedIndex(index);
            }}
            className="mt-3 rounded-full border border-brand px-4 py-1.5 text-xs font-semibold text-brand-strong transition-colors hover:bg-cyan-50"
          >
            {copiedIndex === index ? "Copied!" : "Copy suggestion"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const { resume, setResumeAnalysis, setResumeAnalysisFailed } = useWizard();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // All state updates happen inside the timeout callback (a same-tick
  // setTimeout(fn, 0)), not synchronously in the effect body, to avoid
  // the react-hooks/set-state-in-effect render-cascade lint error —
  // same pattern as the job-description live preview.
  useEffect(() => {
    if (!resume) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void analyzeResume(resume).then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setError(result.error.message);
          // Unblocks the wizard-wide navigation gate (see
          // resume-analysis-gate.tsx) — a failed analysis must not be a
          // permanent dead end.
          setResumeAnalysisFailed(true);
          return;
        }
        setAnalysis(result.data);
        // Persisted so feature 004's /analyze/match can find it without
        // recomputing — see wizard-state.ts.
        setResumeAnalysis(result.data);
      });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [resume, setResumeAnalysis, setResumeAnalysisFailed]);

  const isLoading = resume !== null && analysis === null && error === null;
  const loadingMessage = useLoadingMessage(isLoading);

  if (!resume) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-n-200 bg-white px-6 py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Resume analysis
        </h1>
        <p className="max-w-md text-sm text-n-600">
          Upload a resume first to see your score, ATS checks, and
          feedback.
        </p>
        <Link
          href="/analyze/upload"
          className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Upload your resume →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Resume analysis
        </h1>
        <p className="text-sm text-n-600">
          Your resume&apos;s score, ATS/formatting checks, and feedback —
          no job description needed yet.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-n-200 bg-white px-6 py-12">
          {/* One calm, static announcement for screen readers — the
              cycling text below is decorative flavor for sighted users,
              not re-announced on every change (would be excessive over
              a ~60s wait). */}
          <span className="sr-only" aria-live="polite">
            Analyzing your resume — this can take up to a minute.
          </span>
          <div
            aria-hidden="true"
            className="h-36 w-36 animate-pulse rounded-full bg-n-200"
          />
          <p
            aria-hidden="true"
            className="text-sm font-medium text-brand-strong"
          >
            {loadingMessage}
          </p>
          <div
            aria-hidden="true"
            className="h-1.5 w-48 overflow-hidden rounded-full bg-n-200"
          >
            <div className="animate-indeterminate h-full w-1/3 rounded-full bg-brand-strong" />
          </div>
        </div>
      ) : null}

      {error ? (
        <>
          <p role="alert" className="text-sm font-medium text-danger-strong">
            {error}
          </p>
          <div className="flex justify-end pt-2">
            <Link
              href="/analyze/job"
              className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Continue to job description →
            </Link>
          </div>
        </>
      ) : null}

      {analysis ? (
        <>
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-n-200 bg-white p-6 sm:flex-row sm:items-start">
            <ScoreRing score={analysis.overallScore} />
            <div className="flex-1">
              <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
                ATS / formatting checks
              </p>
              <AtsChecklist checks={analysis.atsChecks} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
              Section-by-section feedback
            </p>
            <SectionFeedbackList feedback={analysis.sectionFeedback} />
          </div>

          <div className="rounded-2xl border border-n-200 bg-white p-5">
            <StrengthsWeaknesses
              strengths={analysis.strengths}
              weaknesses={analysis.weaknesses}
            />
          </div>

          {analysis.rewriteSuggestions.length > 0 ? (
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
                Rewrite suggestions
              </p>
              <RewriteSuggestions suggestions={analysis.rewriteSuggestions} />
            </div>
          ) : null}

          <div className="flex justify-end pt-2">
            <Link
              href="/analyze/job"
              className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Next: paste a job description →
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
