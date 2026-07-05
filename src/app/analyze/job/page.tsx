"use client";

import { useEffect, useMemo, useState } from "react";
import { JobIcon } from "@/components/icons";
import { createLatestOnly } from "@/lib/llm/latest-only";
import type { JDAnalysis } from "@/lib/llm/schemas";
import { useWizard } from "../wizard-context";
import { analyzeJobDescription, submitJobDescription } from "./actions";

const DEBOUNCE_MS = 750;

function ChipGroup({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "required" | "nice" | "keyword";
}) {
  if (items.length === 0) return null;

  const toneClass =
    tone === "required"
      ? "bg-cyan-50 text-brand-strong"
      : tone === "nice"
        ? "bg-n-100 text-n-700"
        : "border border-n-300 text-n-700";

  return (
    <div>
      <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function JobDescriptionPage() {
  const { setJobDescription, jobDescription, setJdAnalysis } = useWizard();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const canSubmit = text.trim().length > 0 && !isSubmitting;

  const [preview, setPreview] = useState<JDAnalysis | null>(null);
  const [previewStatus, setPreviewStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [previewError, setPreviewError] = useState<string | null>(null);

  const runLatestOnly = useMemo(
    () => createLatestOnly<Awaited<ReturnType<typeof analyzeJobDescription>>>(),
    [],
  );

  // Live keyword-detection preview: debounced (not on every keystroke,
  // per FR-002), and guarded against a stale in-flight response
  // overwriting a fresher one (FR-004, US3) via createLatestOnly. All
  // state updates happen inside the timeout callback (even the
  // "cleared" case) rather than synchronously in the effect body, to
  // avoid a same-tick render cascade.
  useEffect(() => {
    const isEmpty = text.trim().length === 0;

    const timer = setTimeout(
      () => {
        if (isEmpty) {
          setPreview(null);
          setPreviewStatus("idle");
          setPreviewError(null);
          return;
        }

        setPreviewStatus("loading");
        void runLatestOnly(() => analyzeJobDescription(text)).then(
          (outcome) => {
            if (outcome.stale) return;
            const result = outcome.value;
            if (!result.ok) {
              setPreviewStatus("error");
              setPreviewError(result.error.message);
              return;
            }
            setPreview(result.data);
            setPreviewStatus("idle");
            setPreviewError(null);
            // Persisted so feature 004's /analyze/match can find it
            // without recomputing — see wizard-state.ts.
            setJdAnalysis(result.data);
          },
        );
      },
      isEmpty ? 0 : DEBOUNCE_MS,
    );

    return () => clearTimeout(timer);
  }, [text, runLatestOnly, setJdAnalysis]);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("text", text);
    formData.set("title", title);
    formData.set("company", company);

    const result = await submitJobDescription(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setJobDescription(result.data);
    setIsEditing(false);
  }

  function startEditing() {
    if (jobDescription) {
      setText(jobDescription.rawText);
      setTitle(jobDescription.title ?? "");
      setCompany(jobDescription.company ?? "");
    }
    setError(null);
    setIsEditing(true);
  }

  if (jobDescription && !isEditing) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-n-200 bg-white px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-strong text-xl text-white">
          ✓
        </span>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Job description ready
        </h1>
        <p className="max-w-md text-sm text-n-600">
          {jobDescription.title ? `"${jobDescription.title}"` : "This job"}
          {jobDescription.company ? ` at ${jobDescription.company}` : ""} is
          saved for this session. Analysis and matching land in the next
          features — for now, both your resume and job description are
          captured and ready.
        </p>
        <button
          type="button"
          onClick={startEditing}
          className="rounded-full border border-brand px-5 py-2 text-sm font-semibold text-brand-strong transition-colors hover:bg-cyan-50"
        >
          Change job description
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <JobIcon className="h-8 w-8 flex-none text-brand" aria-hidden="true" />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {jobDescription ? "Update the job description" : "Paste the job description"}
          </h1>
          <p className="text-sm text-n-600">
            Title and company are optional — just for your report header.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Job title (optional)</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Solutions Architect"
            className="focus:ring-brand/30 rounded-xl border border-n-300 bg-white p-3 text-ink focus:border-brand focus:ring-2 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-ink">Company (optional)</span>
          <input
            type="text"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="e.g. Acme Cloud"
            className="focus:ring-brand/30 rounded-xl border border-n-300 bg-white p-3 text-ink focus:border-brand focus:ring-2 focus:outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">
          Paste the full job description
        </span>
        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError(null);
          }}
          placeholder="Paste job description here…"
          rows={10}
          className="focus:ring-brand/30 w-full rounded-xl border border-n-300 bg-white p-4 text-sm text-ink focus:border-brand focus:ring-2 focus:outline-none"
        />
      </label>

      {text.trim().length > 0 ? (
        <div
          aria-live="polite"
          className="rounded-2xl border border-n-200 bg-white p-5"
        >
          <p className="mb-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Detected requirements & keywords
          </p>

          {previewStatus === "loading" && !preview ? (
            <div className="flex flex-col gap-2">
              <span className="sr-only">Analyzing job description…</span>
              <div
                aria-hidden="true"
                className="h-4 w-2/3 animate-pulse rounded bg-n-200"
              />
              <div
                aria-hidden="true"
                className="h-4 w-1/2 animate-pulse rounded bg-n-200"
              />
              <div
                aria-hidden="true"
                className="h-4 w-3/4 animate-pulse rounded bg-n-200"
              />
            </div>
          ) : null}

          {previewStatus === "error" ? (
            <p role="alert" className="text-sm font-medium text-danger-strong">
              {previewError}
            </p>
          ) : null}

          {preview ? (
            <div className="flex flex-col gap-4">
              <ChipGroup
                label="Required skills"
                items={preview.requiredSkills}
                tone="required"
              />
              <ChipGroup
                label="Nice to have"
                items={preview.niceToHaveSkills}
                tone="nice"
              />
              <ChipGroup
                label="ATS keywords"
                items={preview.atsKeywords}
                tone="keyword"
              />
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-n-600 uppercase">
                  Seniority
                </p>
                <p className="text-sm text-ink capitalize">
                  {preview.inferredSeniority}
                </p>
              </div>
              {preview.responsibilities.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wide text-n-600 uppercase">
                    Core responsibilities
                  </p>
                  <ul className="list-disc pl-5 text-sm text-ink">
                    {preview.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {preview.notableSignals.length > 0 ? (
                <div>
                  <p className="mb-1 text-xs font-semibold tracking-wide text-n-600 uppercase">
                    Notable signals
                  </p>
                  <ul className="list-disc pl-5 text-sm text-ink">
                    {preview.notableSignals.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger-strong">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-xs text-n-600">
          🔒 Analyzed in-session · never stored
        </p>
        <div className="flex items-center gap-3">
          {jobDescription && isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-sm font-semibold text-n-600 hover:text-ink"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-n-300"
          >
            {isSubmitting ? "Saving…" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
