import { readFile } from "node:fs/promises";
import path from "node:path";
import { devFakeAnalysis } from "./fake-provider";
import { generateStructured, type ProviderResult } from "./provider";
import { JDAnalysisSchema, type JDAnalysis } from "./schemas";

const PROMPT_PATH = path.join(process.cwd(), "prompts", "jd-analysis.v1.md");

function promptBody(fileContents: string): string {
  const withoutFrontmatter = fileContents.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFrontmatter.trim();
}

/**
 * Analyzes a job description's raw text into a `JDAnalysis`. Internal
 * interface behind the Server Action — see
 * specs/002-jd-analysis/contracts/actions.md.
 */
export async function analyzeJobDescription(
  text: string,
): Promise<ProviderResult<JDAnalysis>> {
  if (process.env.FITTD_FAKE_PROVIDER === "true") {
    return devFakeAnalysis("jd-analysis", text);
  }

  const template = promptBody(await readFile(PROMPT_PATH, "utf-8"));
  const prompt = template.replace("{{jd_text}}", text);

  return generateStructured({ prompt, schema: JDAnalysisSchema });
}
