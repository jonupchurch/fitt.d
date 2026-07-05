import { readFile } from "node:fs/promises";
import path from "node:path";
import { generateStructured, type ProviderResult } from "./provider";
import { JDAnalysisSchema, type JDAnalysis } from "./schemas";

const PROMPT_PATH = path.join(process.cwd(), "prompts", "jd-analysis.v1.md");

function promptBody(fileContents: string): string {
  const withoutFrontmatter = fileContents.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFrontmatter.trim();
}

/**
 * Deterministic stand-in used only when `FITTD_FAKE_PROVIDER=true` —
 * set by Playwright's dev server (playwright.config.ts) so e2e tests
 * exercise the real UI/Server Action/debounce path without a live
 * model call, per Constitution Principle V (network-free tests).
 */
const FAKE_ANALYSIS: JDAnalysis = {
  requiredSkills: ["React", "TypeScript"],
  niceToHaveSkills: ["Next.js"],
  responsibilities: ["Build and maintain user-facing features"],
  inferredSeniority: "senior",
  atsKeywords: ["react", "typescript"],
  notableSignals: [],
};

/**
 * Analyzes a job description's raw text into a `JDAnalysis`. Internal
 * interface behind the Server Action — see
 * specs/002-jd-analysis/contracts/actions.md.
 */
export async function analyzeJobDescription(
  text: string,
): Promise<ProviderResult<JDAnalysis>> {
  if (process.env.FITTD_FAKE_PROVIDER === "true") {
    // A magic phrase lets e2e tests exercise the graceful-degradation
    // path (quickstart.md scenario 6) without a real model.
    if (text.toLowerCase().includes("trigger_fake_error")) {
      return { ok: false, reason: "invalid_output" };
    }

    // Derives one field from the input so e2e tests can meaningfully
    // assert that editing the JD produces a fresh result (US3), not
    // just a static fixture.
    return {
      ok: true,
      data: {
        ...FAKE_ANALYSIS,
        notableSignals: text.toLowerCase().includes("kubernetes")
          ? ["Mentions Kubernetes"]
          : [],
      },
    };
  }

  const template = promptBody(await readFile(PROMPT_PATH, "utf-8"));
  const prompt = template.replace("{{jd_text}}", text);

  return generateStructured({ prompt, schema: JDAnalysisSchema });
}
