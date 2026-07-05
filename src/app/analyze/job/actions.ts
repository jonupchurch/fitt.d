"use server";

import { headers } from "next/headers";
import {
  JobDescriptionSchema,
  type JobDescription,
  type Result,
} from "@/lib/input/schemas";
import { validateText } from "@/lib/input/validate-text";
import { analyzeJobDescription as runJdAnalysis } from "@/lib/llm/analyze-jd";
import { checkRateLimit } from "@/lib/llm/rate-limit";
import type { JDAnalysis, Result as AnalysisResult } from "@/lib/llm/schemas";

/**
 * Accepts pasted job description text plus optional title/company and
 * returns a normalized, validated `JobDescription`. See
 * specs/001-resume-jd-input/contracts/actions.md.
 */
export async function submitJobDescription(
  formData: FormData,
): Promise<Result<JobDescription>> {
  const rawText = formData.get("text");
  const validated = validateText(
    typeof rawText === "string" ? rawText : "",
    "jobDescription",
  );
  if (!validated.ok) return validated;

  const title = formData.get("title");
  const company = formData.get("company");

  return {
    ok: true,
    data: JobDescriptionSchema.parse({
      rawText: validated.data.text,
      sizeChars: validated.data.sizeChars,
      title: typeof title === "string" && title.trim() ? title.trim() : undefined,
      company:
        typeof company === "string" && company.trim()
          ? company.trim()
          : undefined,
    }),
  };
}

async function requestKey(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/**
 * Analyzes a job description's text into a `JDAnalysis` — the live
 * keyword-detection preview. Called repeatedly (debounced client-side,
 * per FR-002) as the candidate edits the pasted text. See
 * specs/002-jd-analysis/contracts/actions.md.
 */
export async function analyzeJobDescription(
  text: string,
): Promise<AnalysisResult<JDAnalysis>> {
  if (text.trim().length === 0) {
    return {
      ok: false,
      error: { code: "empty_input", message: "No job description text to analyze." },
    };
  }

  const key = await requestKey();
  if (!checkRateLimit(key)) {
    return {
      ok: false,
      error: {
        code: "rate_limited",
        message: "You're analyzing a bit fast — please wait a moment and try again.",
      },
    };
  }

  const result = await runJdAnalysis(text);
  if (result.ok) {
    return { ok: true, data: result.data };
  }

  return {
    ok: false,
    error:
      result.reason === "invalid_output"
        ? {
            code: "invalid_model_output",
            message: "We couldn't analyze this job description right now. Please try again.",
          }
        : {
            code: "provider_unavailable",
            message: "The analysis service is temporarily unavailable. Please try again shortly.",
          },
  };
}
