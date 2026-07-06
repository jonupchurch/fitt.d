"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loadSampleFixture } from "@/lib/input/sample-fixture";
import {
  setStoredJobDescription,
  setStoredResume,
} from "@/lib/input/wizard-state";

export function TrySampleButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    const result = await loadSampleFixture();
    setIsLoading(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    // Populates the same session state a manual upload/paste would
    // (FR-008) — the wizard layout's context reads it fresh on mount.
    setStoredResume(result.data.resume);
    setStoredJobDescription(result.data.jobDescription);
    // The sample resume still needs its own analysis run (no canned
    // ResumeAnalysis is set here) — land on /analyze/report like a real
    // upload does, so the same navigation gate applies (ADR-0009).
    router.push("/analyze/report");
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Loading sample…" : "Try a sample"}
      </button>
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger-strong">
          {error}
        </p>
      ) : null}
    </div>
  );
}
