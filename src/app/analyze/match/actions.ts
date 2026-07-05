"use server";

import { headers } from "next/headers";
import { analyzeGap as runGapAnalysis } from "@/lib/llm/analyze-gap";
import { checkRateLimit } from "@/lib/llm/rate-limit";
import type {
  GapAnalysis,
  JDAnalysis,
  ResumeAnalysis,
  Result,
} from "@/lib/llm/schemas";

async function requestKey(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/**
 * Compares a `JDAnalysis` and `ResumeAnalysis` into a `GapAnalysis`.
 * Called once both prerequisite analyses exist client-side (the page
 * shows a waiting state otherwise — spec.md FR-011 — so this action is
 * never called with a missing prerequisite in practice). See
 * specs/004-gap-analysis-tailoring/contracts/actions.md.
 */
export async function analyzeGap(
  jdAnalysis: JDAnalysis,
  resumeAnalysis: ResumeAnalysis,
): Promise<Result<GapAnalysis>> {
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

  const result = await runGapAnalysis(jdAnalysis, resumeAnalysis);
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
              "We couldn't compare your resume to this job right now. Please try again.",
          }
        : {
            code: "provider_unavailable",
            message:
              "The analysis service is temporarily unavailable. Please try again shortly.",
          },
  };
}
