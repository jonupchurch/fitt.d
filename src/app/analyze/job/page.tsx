"use client";

import { useState } from "react";
import { JobIcon } from "@/components/icons";
import { useWizard } from "../wizard-context";
import { submitJobDescription } from "./actions";

export default function JobDescriptionPage() {
  const { setJobDescription, jobDescription } = useWizard();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = text.trim().length > 0 && !isSubmitting;

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
  }

  if (jobDescription) {
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <JobIcon className="h-8 w-8 flex-none text-brand" aria-hidden="true" />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Paste the job description
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

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-xs text-n-600">
          🔒 Analyzed in-session · never stored
        </p>
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
  );
}
