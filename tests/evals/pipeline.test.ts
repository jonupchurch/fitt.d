import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/llm/analyze-jd", () => ({
  analyzeJobDescription: vi.fn(),
}));
vi.mock("../../src/lib/llm/analyze-resume", () => ({
  analyzeResume: vi.fn(),
}));
vi.mock("../../src/lib/llm/analyze-gap", () => ({
  analyzeGap: vi.fn(),
}));
vi.mock("../../src/lib/llm/tailor-resume", () => ({
  tailorResumeResponse: vi.fn(),
}));

import { analyzeGap } from "../../src/lib/llm/analyze-gap";
import { analyzeJobDescription } from "../../src/lib/llm/analyze-jd";
import { analyzeResume } from "../../src/lib/llm/analyze-resume";
import { tailorResumeResponse } from "../../src/lib/llm/tailor-resume";
import { runPipeline } from "../../evals/pipeline";
import type {
  GapAnalysis,
  JDAnalysis,
  ResumeAnalysis,
  TailoringOutput,
} from "../../src/lib/llm/schemas";

const jdAnalysis: JDAnalysis = {
  requiredSkills: ["React"],
  niceToHaveSkills: [],
  responsibilities: [],
  inferredSeniority: "senior",
  atsKeywords: [],
  notableSignals: [],
};

const resumeAnalysis: ResumeAnalysis = {
  sections: {
    contact: {},
    experience: [],
    skills: ["React"],
    education: [],
  },
  atsChecks: [],
  sectionFeedback: [],
  strengths: [],
  weaknesses: [],
  overallScore: 80,
  rewriteSuggestions: [],
};

const gapAnalysis: GapAnalysis = {
  fitScore: 70,
  matchedSkills: [{ skill: "React", evidence: "Listed" }],
  missingSkills: [],
  keywordCoverage: { covered: ["react"], missing: [] },
  rationale: "Good match.",
  closingAdvice: [],
};

const tailoringOutput: TailoringOutput = {
  rewrittenBullets: [],
  rewrittenSummary: "",
  keywordsToWeave: [],
  coverLetterOpener: "",
};

function fakeResponse(body: unknown): Response {
  return { text: async () => JSON.stringify(body) } as Response;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("runPipeline (evals/pipeline.ts)", () => {
  it("chains all four stages and returns their combined output on full success", async () => {
    vi.mocked(analyzeJobDescription).mockResolvedValue({
      ok: true,
      data: jdAnalysis,
    });
    vi.mocked(analyzeResume).mockResolvedValue({
      ok: true,
      data: resumeAnalysis,
    });
    vi.mocked(analyzeGap).mockResolvedValue({ ok: true, data: gapAnalysis });
    vi.mocked(tailorResumeResponse).mockResolvedValue(
      fakeResponse(tailoringOutput),
    );

    const result = await runPipeline({
      resumeText: "resume",
      jobDescriptionText: "jd",
    });

    expect(result).toEqual({
      jdAnalysis,
      resumeAnalysis,
      gapAnalysis,
      tailoringOutput,
    });
    expect(result.failedAt).toBeUndefined();
  });

  it("stops at jd-analysis and never calls later stages when it fails", async () => {
    vi.mocked(analyzeJobDescription).mockResolvedValue({
      ok: false,
      reason: "provider_error",
    });

    const result = await runPipeline({
      resumeText: "resume",
      jobDescriptionText: "jd",
    });

    expect(result.failedAt).toBe("jd-analysis");
    expect(analyzeResume).not.toHaveBeenCalled();
    expect(analyzeGap).not.toHaveBeenCalled();
    expect(tailorResumeResponse).not.toHaveBeenCalled();
  });

  it("stops at gap-analysis, preserving the two upstream results it already had", async () => {
    vi.mocked(analyzeJobDescription).mockResolvedValue({
      ok: true,
      data: jdAnalysis,
    });
    vi.mocked(analyzeResume).mockResolvedValue({
      ok: true,
      data: resumeAnalysis,
    });
    vi.mocked(analyzeGap).mockResolvedValue({
      ok: false,
      reason: "invalid_output",
    });

    const result = await runPipeline({
      resumeText: "resume",
      jobDescriptionText: "jd",
    });

    expect(result.failedAt).toBe("gap-analysis");
    expect(result.jdAnalysis).toEqual(jdAnalysis);
    expect(result.resumeAnalysis).toEqual(resumeAnalysis);
    expect(tailorResumeResponse).not.toHaveBeenCalled();
  });

  it("reports a tailoring failure when the streamed response isn't valid JSON", async () => {
    vi.mocked(analyzeJobDescription).mockResolvedValue({
      ok: true,
      data: jdAnalysis,
    });
    vi.mocked(analyzeResume).mockResolvedValue({
      ok: true,
      data: resumeAnalysis,
    });
    vi.mocked(analyzeGap).mockResolvedValue({ ok: true, data: gapAnalysis });
    vi.mocked(tailorResumeResponse).mockResolvedValue({
      text: async () => "not valid json",
    } as Response);

    const result = await runPipeline({
      resumeText: "resume",
      jobDescriptionText: "jd",
    });

    expect(result.failedAt).toBe("tailoring");
    expect(result.gapAnalysis).toEqual(gapAnalysis);
  });
});
