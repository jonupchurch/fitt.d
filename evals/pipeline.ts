import { analyzeGap } from "../src/lib/llm/analyze-gap";
import { analyzeJobDescription } from "../src/lib/llm/analyze-jd";
import { analyzeResume } from "../src/lib/llm/analyze-resume";
import { tailorResumeResponse } from "../src/lib/llm/tailor-resume";
import {
  TailoringOutputSchema,
  type GapAnalysis,
  type JDAnalysis,
  type ResumeAnalysis,
  type TailoringOutput,
} from "../src/lib/llm/schemas";

/**
 * Chains the four real analysis stages exactly as the app itself does
 * (`/analyze/*`'s Server Actions and Route Handler), so the eval
 * harness exercises the genuine pipeline rather than a parallel
 * reimplementation. Stops at the first stage that fails — later stages
 * all depend on earlier output — and records which stage, so
 * `scorers.ts`'s schema-validity scorer can report it precisely.
 */
export interface PipelineRunResult {
  jdAnalysis?: JDAnalysis;
  resumeAnalysis?: ResumeAnalysis;
  gapAnalysis?: GapAnalysis;
  tailoringOutput?: TailoringOutput;
  failedAt?: "jd-analysis" | "resume-analysis" | "gap-analysis" | "tailoring";
  failureDetail?: string;
}

export async function runPipeline(fixture: {
  resumeText: string;
  jobDescriptionText: string;
}): Promise<PipelineRunResult> {
  const jdResult = await analyzeJobDescription(fixture.jobDescriptionText);
  if (!jdResult.ok) {
    return { failedAt: "jd-analysis", failureDetail: jdResult.reason };
  }

  const resumeResult = await analyzeResume(fixture.resumeText);
  if (!resumeResult.ok) {
    return {
      jdAnalysis: jdResult.data,
      failedAt: "resume-analysis",
      failureDetail: resumeResult.reason,
    };
  }

  const gapResult = await analyzeGap(jdResult.data, resumeResult.data);
  if (!gapResult.ok) {
    return {
      jdAnalysis: jdResult.data,
      resumeAnalysis: resumeResult.data,
      failedAt: "gap-analysis",
      failureDetail: gapResult.reason,
    };
  }

  const tailoringResponse = await tailorResumeResponse(
    gapResult.data,
    resumeResult.data,
    jdResult.data,
  );
  const tailoringText = await tailoringResponse.text();

  let tailoringJson: unknown;
  try {
    tailoringJson = JSON.parse(tailoringText);
  } catch (error) {
    return {
      jdAnalysis: jdResult.data,
      resumeAnalysis: resumeResult.data,
      gapAnalysis: gapResult.data,
      failedAt: "tailoring",
      failureDetail: `not valid JSON: ${(error as Error).message}`,
    };
  }

  const tailoringParsed = TailoringOutputSchema.safeParse(tailoringJson);
  if (!tailoringParsed.success) {
    return {
      jdAnalysis: jdResult.data,
      resumeAnalysis: resumeResult.data,
      gapAnalysis: gapResult.data,
      failedAt: "tailoring",
      failureDetail: tailoringParsed.error.message,
    };
  }

  return {
    jdAnalysis: jdResult.data,
    resumeAnalysis: resumeResult.data,
    gapAnalysis: gapResult.data,
    tailoringOutput: tailoringParsed.data,
  };
}
