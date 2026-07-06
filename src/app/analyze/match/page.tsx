"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { highlightMatches, type HighlightedSegment } from "@/lib/compare/highlight";
import { buildTailoredResumeDocx } from "@/lib/export/build-docx";
import {
  TailoringOutputSchema,
  type GapAnalysis,
  type ResumeAnalysis,
  type TailoringOutput,
} from "@/lib/llm/schemas";
import {
  applyBullet,
  getWorkingCopy,
  initWorkingCopy,
} from "@/lib/resume/working-copy";
import { encodeShareLink } from "@/lib/share/report-link";
import { useWizard } from "../wizard-context";
import { analyzeGap } from "./actions";

const GAP_LOADING_MESSAGES = [
  "Comparing your resume to the job…",
  "Weighing required vs. nice-to-have skills…",
  "Checking keyword coverage…",
  "Calculating your fit score…",
  "Drafting advice…",
];
const LOADING_MESSAGE_INTERVAL_MS = 2200;

function useLoadingMessage(active: boolean, messages: string[]): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, LOADING_MESSAGE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [active, messages]);

  return messages[index];
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Strong match";
  if (score >= 65) return "Good match";
  if (score >= 40) return "Partial match";
  return "Weak match";
}

function ScoreRing({ score, label }: { score: number; label: string }) {
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
        {label}: {score} out of 100 — {scoreLabel(score)}
      </span>
    </div>
  );
}

const PRIORITY_LABELS: Record<string, string> = {
  "must-have": "Must-have",
  "worth-adding": "Worth adding",
  minor: "Minor",
};

function MatchedMissingSkills({
  matched,
  missing,
}: {
  matched: GapAnalysis["matchedSkills"];
  missing: GapAnalysis["missingSkills"];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
          Matched skills
        </p>
        <ul className="flex flex-col gap-2">
          {matched.map((entry) => (
            <li key={entry.skill} className="flex items-start gap-2 text-sm">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-brand-strong"
              >
                ✓
              </span>
              <span>
                <span className="font-medium text-ink">Matched: </span>
                <span className="text-n-700">{entry.skill}</span>
                <span className="block text-n-600">{entry.evidence}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
          Missing skills
        </p>
        <ul className="flex flex-col gap-2">
          {missing.map((entry) => (
            <li key={entry.skill} className="flex items-start gap-2 text-sm">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-n-100 text-xs font-bold text-n-700"
              >
                −
              </span>
              <span>
                <span className="font-medium text-ink">Missing: </span>
                <span className="text-n-700">{entry.skill}</span>
                <span className="ml-2 rounded-full border border-warning-strong px-2 py-0.5 text-xs font-semibold text-warning-strong">
                  {PRIORITY_LABELS[entry.priority] ?? entry.priority}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KeywordCoverage({
  coverage,
}: {
  coverage: GapAnalysis["keywordCoverage"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
          Covered keywords
        </p>
        <div className="flex flex-wrap gap-2">
          {coverage.covered.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-brand-strong"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
          Missing keywords
        </p>
        <div className="flex flex-wrap gap-2">
          {coverage.missing.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-n-300 px-3 py-1 text-xs font-medium text-n-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClosingAdvice({ advice }: { advice: GapAnalysis["closingAdvice"] }) {
  if (advice.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
        Closing the gap
      </p>
      <ol className="flex flex-col gap-2 text-sm text-ink">
        {advice.map((entry, index) => (
          <li key={entry.skill} className="flex gap-2">
            <span className="font-semibold text-brand-strong">
              {index + 1}.
            </span>
            <span>
              <span className="font-medium">{entry.skill}: </span>
              {entry.suggestion}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Renders a resume's structured sections as plain, readable text — the
 * input `highlightMatches()` runs against for the comparison view. */
function sectionsToText(sections: ResumeAnalysis["sections"]): string {
  const parts: string[] = [];
  if (sections.summary) parts.push(sections.summary);
  for (const entry of sections.experience) {
    const roleLine = [entry.role, entry.company].filter(Boolean).join(" — ");
    if (roleLine) parts.push(roleLine);
    parts.push(...entry.bullets);
  }
  if (sections.skills.length > 0) {
    parts.push(`Skills: ${sections.skills.join(", ")}`);
  }
  for (const entry of sections.education) {
    const line = [entry.institution, entry.credential]
      .filter(Boolean)
      .join(" — ");
    if (line) parts.push(line);
  }
  return parts.join("\n");
}

function HighlightedText({ segments }: { segments: HighlightedSegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark key={index} className="rounded bg-cyan-100 px-0.5 text-ink">
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}

function ComparisonPanel({
  resumeText,
  jobDescriptionText,
  matchedSkillNames,
}: {
  resumeText: string;
  jobDescriptionText: string;
  matchedSkillNames: string[];
}) {
  const [activeTab, setActiveTab] = useState<"resume" | "job">("resume");

  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
        Side-by-side comparison
      </p>
      <div className="mb-3 flex gap-2 print:hidden sm:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("resume")}
          aria-pressed={activeTab === "resume"}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            activeTab === "resume"
              ? "bg-brand-strong text-white"
              : "border border-n-300 text-n-700"
          }`}
        >
          Resume
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("job")}
          aria-pressed={activeTab === "job"}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            activeTab === "job"
              ? "bg-brand-strong text-white"
              : "border border-n-300 text-n-700"
          }`}
        >
          Job description
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className={`rounded-2xl border border-n-200 bg-white p-5 ${
            activeTab === "resume" ? "" : "hidden sm:block"
          }`}
        >
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Your resume
          </p>
          <p className="text-sm whitespace-pre-line text-ink">
            <HighlightedText
              segments={highlightMatches(resumeText, matchedSkillNames)}
            />
          </p>
        </div>
        <div
          className={`rounded-2xl border border-n-200 bg-white p-5 ${
            activeTab === "job" ? "" : "hidden sm:block"
          }`}
        >
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Job description
          </p>
          <p className="text-sm whitespace-pre-line text-ink">
            <HighlightedText
              segments={highlightMatches(
                jobDescriptionText,
                matchedSkillNames,
              )}
            />
          </p>
        </div>
      </div>
    </div>
  );
}

type PartialBullet = {
  original?: string;
  rewritten?: string;
  whyStronger?: string;
};

function TailoringPanel({
  bullets,
  summary,
  keywords,
  coverLetterOpener,
  isFinal,
  onApply,
  appliedIndices,
}: {
  bullets: PartialBullet[];
  summary: string | undefined;
  keywords: string[] | undefined;
  coverLetterOpener: string | undefined;
  isFinal: boolean;
  onApply: (index: number, original: string, rewritten: string) => void;
  appliedIndices: Set<number>;
}) {
  const [copiedOpener, setCopiedOpener] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {bullets.length > 0 ? (
        <div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Tailored bullet rewrites
          </p>
          <div className="flex flex-col gap-4">
            {bullets.map((bullet, index) => {
              if (!bullet?.original || !bullet.rewritten) return null;
              const applied = appliedIndices.has(index);
              return (
                <div
                  key={`${index}-${bullet.original}`}
                  className="rounded-xl border border-n-200 bg-white p-4"
                >
                  <p className="text-sm text-n-600">
                    <span className="font-medium text-ink">Before: </span>
                    {bullet.original}
                  </p>
                  <p className="mt-1 text-sm text-ink">
                    <span className="font-medium">After: </span>
                    {bullet.rewritten}
                  </p>
                  {bullet.whyStronger ? (
                    <p className="mt-2 text-xs text-n-600">
                      {bullet.whyStronger}
                    </p>
                  ) : null}
                  {isFinal ? (
                    applied ? (
                      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-cyan-50 px-4 py-1.5 text-xs font-semibold text-brand-strong">
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onApply(index, bullet.original!, bullet.rewritten!)
                        }
                        className="mt-3 rounded-full border border-brand px-4 py-1.5 text-xs font-semibold text-brand-strong transition-colors hover:bg-cyan-50 print:hidden"
                      >
                        Apply to working copy
                      </button>
                    )
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {summary ? (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Rewritten summary
          </p>
          <p className="rounded-xl border border-n-200 bg-white p-4 text-sm text-ink">
            {summary}
          </p>
        </div>
      ) : null}

      {keywords && keywords.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Keywords to weave in
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-n-300 px-3 py-1 text-xs font-medium text-n-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {coverLetterOpener ? (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Cover letter opener
          </p>
          <div className="rounded-xl border border-n-200 bg-white p-4">
            <p className="text-sm text-ink">{coverLetterOpener}</p>
            {isFinal ? (
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(coverLetterOpener);
                  setCopiedOpener(true);
                }}
                className="mt-3 rounded-full border border-brand px-4 py-1.5 text-xs font-semibold text-brand-strong transition-colors hover:bg-cyan-50 print:hidden"
              >
                {copiedOpener ? "Copied!" : "Copy opener"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function MatchPage() {
  const router = useRouter();
  const { resume, jobDescription, jdAnalysis, resumeAnalysis, resetForNewJob } =
    useWizard();

  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [gapError, setGapError] = useState<string | null>(null);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [tailoringOutput, setTailoringOutput] =
    useState<TailoringOutput | null>(null);
  const [tailoringError, setTailoringError] = useState<string | null>(null);
  const hasStartedTailoringRef = useRef(false);
  const hasRetriedTailoringRef = useRef(false);

  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(
    () => new Set(),
  );

  const isGapLoading =
    jdAnalysis !== null &&
    resumeAnalysis !== null &&
    gapAnalysis === null &&
    gapError === null;
  const gapLoadingMessage = useLoadingMessage(
    isGapLoading,
    GAP_LOADING_MESSAGES,
  );

  const {
    object: tailoringPreview,
    submit: submitTailoring,
    isLoading: isTailoringLoading,
  } = useObject({
    api: "/api/tailor-resume",
    schema: TailoringOutputSchema,
    onFinish: ({ object, error }) => {
      if (object) {
        setTailoringOutput(object);
        setTailoringError(null);
        return;
      }
      if (
        !hasRetriedTailoringRef.current &&
        gapAnalysis &&
        resumeAnalysis &&
        jdAnalysis
      ) {
        // Streamed output can't be repaired mid-flight the way a
        // blocking call can — restart the whole call once, then
        // degrade to a clear message (research.md).
        hasRetriedTailoringRef.current = true;
        submitTailoring({ gapAnalysis, resumeAnalysis, jdAnalysis });
        return;
      }
      setTailoringError(
        error?.message ??
          "We couldn't generate tailored suggestions right now. Please try again.",
      );
    },
    onError: (error) => {
      setTailoringError(
        error.message ||
          "The analysis service is temporarily unavailable. Please try again shortly.",
      );
    },
  });

  // All state updates happen inside a same-tick setTimeout(fn, 0), not
  // synchronously in the effect body — avoids react-hooks/set-state-in-effect,
  // same pattern as /analyze/report.
  useEffect(() => {
    if (!jdAnalysis || !resumeAnalysis) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void analyzeGap(jdAnalysis, resumeAnalysis).then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setGapError(result.error.message);
          return;
        }
        setGapAnalysis(result.data);
      });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jdAnalysis, resumeAnalysis]);

  useEffect(() => {
    if (!resumeAnalysis) return;
    initWorkingCopy(resumeAnalysis.sections);

    const timer = setTimeout(() => {
      const existing = getWorkingCopy();
      if (existing) {
        setAppliedIndices(new Set(existing.appliedBulletIds.map(Number)));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [resumeAnalysis]);

  useEffect(() => {
    if (
      gapAnalysis &&
      resumeAnalysis &&
      jdAnalysis &&
      !hasStartedTailoringRef.current
    ) {
      hasStartedTailoringRef.current = true;
      submitTailoring({ gapAnalysis, resumeAnalysis, jdAnalysis });
    }
  }, [gapAnalysis, resumeAnalysis, jdAnalysis, submitTailoring]);

  function handleApply(index: number, original: string, rewritten: string) {
    applyBullet(index, original, rewritten);
    setAppliedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  function handleShare() {
    if (!gapAnalysis) return;
    const url = encodeShareLink({
      fitScore: gapAnalysis.fitScore,
      matchedSkills: gapAnalysis.matchedSkills.map((entry) => entry.skill),
      missingSkills: gapAnalysis.missingSkills.map((entry) => entry.skill),
      rationale: gapAnalysis.rationale,
    });
    setShareUrl(url);
    setShareCopied(false);
  }

  function handleCopyShareUrl() {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
  }

  async function handleDownloadDocx() {
    const workingCopy = getWorkingCopy();
    if (!workingCopy) return;
    setIsDownloading(true);
    const blob = await buildTailoredResumeDocx(workingCopy);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tailored-resume.docx";
    link.click();
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  }

  function handleTryAnotherJob() {
    resetForNewJob();
    router.push("/analyze/job");
  }

  if (!resume) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-n-200 bg-white px-6 py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Match & comparison
        </h1>
        <p className="max-w-md text-sm text-n-600">
          Upload a resume to get started.
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

  if (!jdAnalysis || !resumeAnalysis) {
    const waitingFor: string[] = [];
    if (!resumeAnalysis) waitingFor.push("your resume analysis");
    if (!jdAnalysis) waitingFor.push("the job description analysis");

    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-n-200 bg-white px-6 py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Match & comparison
        </h1>
        <p className="max-w-md text-sm text-n-600">
          Still waiting on {waitingFor.join(" and ")}. Come back here once
          {waitingFor.length > 1 ? " they're" : " it's"} ready.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {!resumeAnalysis ? (
            <Link
              href="/analyze/report"
              className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Go to resume analysis →
            </Link>
          ) : null}
          {!jdAnalysis ? (
            <Link
              href="/analyze/job"
              className="rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-cyan-50"
            >
              Go to job description →
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Match & comparison
        </h1>
        <p className="text-sm text-n-600">
          How well your resume fits this job, plus tailored suggestions.
        </p>
      </div>

      {isGapLoading ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-n-200 bg-white px-6 py-12">
          <span className="sr-only" aria-live="polite">
            Comparing your resume to the job description — this can take up
            to a minute.
          </span>
          <div
            aria-hidden="true"
            className="h-36 w-36 animate-pulse rounded-full bg-n-200"
          />
          <p
            aria-hidden="true"
            className="text-sm font-medium text-brand-strong"
          >
            {gapLoadingMessage}
          </p>
          <div
            aria-hidden="true"
            className="h-1.5 w-48 overflow-hidden rounded-full bg-n-200"
          >
            <div className="animate-indeterminate h-full w-1/3 rounded-full bg-brand-strong" />
          </div>
        </div>
      ) : null}

      {gapError ? (
        <p role="alert" className="text-sm font-medium text-danger-strong">
          {gapError}
        </p>
      ) : null}

      {gapAnalysis ? (
        <>
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-n-200 bg-white p-6 sm:flex-row sm:items-start">
            <ScoreRing score={gapAnalysis.fitScore} label="Fit score" />
            <div className="flex-1">
              <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
                Rationale
              </p>
              <p className="text-sm text-ink">{gapAnalysis.rationale}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-n-200 bg-white p-5">
            <MatchedMissingSkills
              matched={gapAnalysis.matchedSkills}
              missing={gapAnalysis.missingSkills}
            />
          </div>

          <div className="rounded-2xl border border-n-200 bg-white p-5">
            <KeywordCoverage coverage={gapAnalysis.keywordCoverage} />
          </div>

          <div className="rounded-2xl border border-n-200 bg-white p-5">
            <ClosingAdvice advice={gapAnalysis.closingAdvice} />
          </div>

          {jobDescription ? (
            <ComparisonPanel
              resumeText={sectionsToText(
                getWorkingCopy()?.sections ?? resumeAnalysis.sections,
              )}
              jobDescriptionText={jobDescription.rawText}
              matchedSkillNames={gapAnalysis.matchedSkills.map(
                (entry) => entry.skill,
              )}
            />
          ) : null}

          {tailoringError ? (
            <p
              role="alert"
              className="text-sm font-medium text-danger-strong"
            >
              {tailoringError}
            </p>
          ) : null}

          {!tailoringOutput && isTailoringLoading && !tailoringPreview ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-n-200 bg-white px-6 py-10">
              <span className="sr-only" aria-live="polite">
                Generating tailored suggestions.
              </span>
              <div
                aria-hidden="true"
                className="h-4 w-2/3 animate-pulse rounded bg-n-200"
              />
              <div
                aria-hidden="true"
                className="h-4 w-1/2 animate-pulse rounded bg-n-200"
              />
            </div>
          ) : null}

          {tailoringOutput || tailoringPreview ? (
            <div>
              <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
                Tailored for this job
              </p>
              <TailoringPanel
                bullets={
                  tailoringOutput?.rewrittenBullets ??
                  tailoringPreview?.rewrittenBullets?.filter(
                    (bullet): bullet is NonNullable<typeof bullet> =>
                      bullet !== undefined,
                  ) ??
                  []
                }
                summary={
                  tailoringOutput?.rewrittenSummary ??
                  tailoringPreview?.rewrittenSummary
                }
                keywords={
                  tailoringOutput?.keywordsToWeave ??
                  tailoringPreview?.keywordsToWeave?.filter(
                    (keyword): keyword is string => keyword !== undefined,
                  )
                }
                coverLetterOpener={
                  tailoringOutput?.coverLetterOpener ??
                  tailoringPreview?.coverLetterOpener
                }
                isFinal={tailoringOutput !== null}
                onApply={handleApply}
                appliedIndices={appliedIndices}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-n-200 bg-white p-5 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-brand-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Export report (PDF)
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand-strong transition-colors hover:bg-cyan-50"
            >
              Get shareable link
            </button>
            <button
              type="button"
              onClick={() => void handleDownloadDocx()}
              disabled={isDownloading}
              className="rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand-strong transition-colors hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloading ? "Preparing…" : "Download tailored resume (.docx)"}
            </button>
            <button
              type="button"
              onClick={handleTryAnotherJob}
              className="rounded-full border border-n-300 px-5 py-2.5 text-sm font-semibold text-n-700 transition-colors hover:bg-n-50"
            >
              Try another job
            </button>
          </div>

          {shareUrl ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-n-200 bg-white p-4 print:hidden">
              <input
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Shareable report link"
                onFocus={(event) => event.target.select()}
                className="min-w-0 flex-1 rounded-lg border border-n-300 bg-n-50 px-3 py-2 text-sm text-ink"
              />
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand-strong transition-colors hover:bg-cyan-50"
              >
                {shareCopied ? "Copied!" : "Copy link"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
