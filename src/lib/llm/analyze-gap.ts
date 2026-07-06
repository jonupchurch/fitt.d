import { readFile } from "node:fs/promises";
import path from "node:path";
import { devFakeGapAnalysis } from "./fake-provider";
import { generateStructured, type ProviderResult } from "./provider";
import {
  GapAnalysisSchema,
  type GapAnalysis,
  type JDAnalysis,
  type ResumeAnalysis,
} from "./schemas";

const PROMPT_PATH = path.join(process.cwd(), "prompts", "gap-analysis.v1.md");

function promptBody(fileContents: string): string {
  const withoutFrontmatter = fileContents.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFrontmatter.trim();
}

/**
 * Compares a `JDAnalysis` and `ResumeAnalysis` into a `GapAnalysis`.
 * Internal interface behind the `analyzeGap` Server Action — see
 * specs/004-gap-analysis-tailoring/contracts/actions.md. Blocking and
 * schema-validated, the same shape as analyze-jd.ts/analyze-resume.ts —
 * only the inputs (two already-structured objects, not raw text) and
 * prompt differ.
 */
export async function analyzeGap(
  jdAnalysis: JDAnalysis,
  resumeAnalysis: ResumeAnalysis,
): Promise<ProviderResult<GapAnalysis>> {
  if (process.env.FITTD_FAKE_PROVIDER === "true") {
    return devFakeGapAnalysis(jdAnalysis);
  }

  const template = promptBody(await readFile(PROMPT_PATH, "utf-8"));
  const prompt = template
    .replace("{{jd_analysis_json}}", JSON.stringify(jdAnalysis))
    .replace("{{resume_analysis_json}}", JSON.stringify(resumeAnalysis));

  return generateStructured({
    prompt,
    schema: GapAnalysisSchema,
    phase: "gap-analysis",
  });
}
