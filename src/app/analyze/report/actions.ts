"use server";

import { headers } from "next/headers";
import type { Resume } from "@/lib/input/schemas";
import { analyzeResume as runResumeAnalysis } from "@/lib/llm/analyze-resume";
import { checkRateLimit } from "@/lib/llm/rate-limit";
import type { ResumeAnalysis, Result } from "@/lib/llm/schemas";

async function requestKey(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/**
 * Analyzes a candidate's resume into a `ResumeAnalysis` — independent
 * of any `JobDescription` (spec.md FR-002). Shares the rate limiter
 * and provider layer with `analyzeJobDescription` (feature 002), per
 * research.md. See specs/003-resume-analysis/contracts/actions.md.
 */
export async function analyzeResume(
  resume: Resume,
): Promise<Result<ResumeAnalysis>> {
  if (resume.rawText.trim().length === 0) {
    return {
      ok: false,
      error: { code: "empty_input", message: "No resume text to analyze." },
    };
  }

  const key = await requestKey();
  if (!checkRateLimit(key)) {
    return {
      ok: false,
      error: {
        code: "rate_limited",
        message:
          "You're analyzing a bit fast — please wait a moment and try again.",
      },
    };
  }

  const result = await runResumeAnalysis(resume.rawText);
  if (result.ok) {
    return { ok: true, data: result.data };
  }

  return {
    ok: false,
    error:
      result.reason === "invalid_output"
        ? {
            code: "invalid_model_output",
            message:
              "We couldn't analyze this resume right now. Please try again.",
          }
        : {
            code: "provider_unavailable",
            message:
              "The analysis service is temporarily unavailable. Please try again shortly.",
          },
  };
}
