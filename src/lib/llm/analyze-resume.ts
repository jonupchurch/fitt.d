import { readFile } from "node:fs/promises";
import path from "node:path";
import { devFakeAnalysis } from "./fake-provider";
import { generateStructured, type ProviderResult } from "./provider";
import { ResumeAnalysisSchema, type ResumeAnalysis } from "./schemas";

const PROMPT_PATH = path.join(
  process.cwd(),
  "prompts",
  "resume-analysis.v1.md",
);

function promptBody(fileContents: string): string {
  const withoutFrontmatter = fileContents.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFrontmatter.trim();
}

/**
 * Analyzes a candidate's resume text into a `ResumeAnalysis`. Internal
 * interface behind the Server Action — see
 * specs/003-resume-analysis/contracts/actions.md. Mirrors
 * analyze-jd.ts's shape exactly, per research.md's "reused
 * infrastructure" decision — same provider wrapper, same repair-retry
 * loop, only the prompt file and output schema differ.
 */
export async function analyzeResume(
  text: string,
): Promise<ProviderResult<ResumeAnalysis>> {
  if (process.env.FITTD_FAKE_PROVIDER === "true") {
    return devFakeAnalysis("resume-analysis", text);
  }

  const template = promptBody(await readFile(PROMPT_PATH, "utf-8"));
  const prompt = template.replace("{{resume_text}}", text);

  return generateStructured({
    prompt,
    schema: ResumeAnalysisSchema,
    phase: "resume-analysis",
  });
}
