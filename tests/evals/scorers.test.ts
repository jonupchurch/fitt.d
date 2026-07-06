import { describe, expect, it } from "vitest";
import type { PipelineRunResult } from "../../evals/pipeline";
import { SCORERS, type ExpectedFixture } from "../../evals/scorers";
import type {
  GapAnalysis,
  JDAnalysis,
  ResumeAnalysis,
} from "../../src/lib/llm/schemas";

const [schemaValidity, requiredSkillRecall, noHallucinatedMatches, scorePlausibility] =
  SCORERS;

const jdAnalysis: JDAnalysis = {
  requiredSkills: ["React", "TypeScript"],
  niceToHaveSkills: ["Next.js"],
  responsibilities: ["Build things"],
  inferredSeniority: "senior",
  atsKeywords: ["react", "typescript"],
  notableSignals: [],
};

const resumeAnalysis: ResumeAnalysis = {
  sections: {
    contact: { name: "Jane Doe" },
    summary: "Frontend engineer with React experience.",
    experience: [
      { role: "Engineer", company: "Acme", bullets: ["Built things"] },
    ],
    skills: ["React", "TypeScript"],
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
  matchedSkills: [
    { skill: "React", evidence: "Listed under skills." },
    { skill: "TypeScript", evidence: "Listed under skills." },
  ],
  missingSkills: [],
  keywordCoverage: { covered: ["react", "typescript"], missing: [] },
  rationale: "Strong match.",
  closingAdvice: [],
};

const expected: ExpectedFixture = {
  requiredSkillsMustInclude: ["react", "typescript"],
  fitScoreRange: [30, 95],
};

const completeRun: PipelineRunResult = {
  jdAnalysis,
  resumeAnalysis,
  gapAnalysis,
  tailoringOutput: {
    rewrittenBullets: [],
    rewrittenSummary: "",
    keywordsToWeave: [],
    coverLetterOpener: "",
  },
};

describe("schemaValidity", () => {
  it("scores 1 when every stage completed", () => {
    const result = schemaValidity!(completeRun, expected);
    expect(result.score).toBe(1);
  });

  it("scores 0 and names the failed stage when the pipeline stopped early", () => {
    const result = schemaValidity!(
      { failedAt: "gap-analysis", failureDetail: "invalid_output" },
      expected,
    );
    expect(result.score).toBe(0);
    expect(result.note).toContain("gap-analysis");
  });
});

describe("requiredSkillRecall", () => {
  it("scores 1.0 when every expected required skill was detected", () => {
    const result = requiredSkillRecall!(completeRun, expected);
    expect(result.score).toBe(1);
  });

  it("scores partial credit when only some expected skills were detected", () => {
    const run: PipelineRunResult = {
      ...completeRun,
      jdAnalysis: { ...jdAnalysis, requiredSkills: ["React"] },
    };
    const result = requiredSkillRecall!(run, expected);
    expect(result.score).toBe(0.5);
  });

  it("scores 0 when the pipeline never reached jd-analysis", () => {
    const result = requiredSkillRecall!({ failedAt: "jd-analysis" }, expected);
    expect(result.score).toBe(0);
  });
});

describe("noHallucinatedMatches", () => {
  it("scores 1.0 when every matched skill is grounded in the resume", () => {
    const result = noHallucinatedMatches!(completeRun, expected);
    expect(result.score).toBe(1);
  });

  it("scores less than 1 when a matched skill has no evidence in the resume", () => {
    const run: PipelineRunResult = {
      ...completeRun,
      gapAnalysis: {
        ...gapAnalysis,
        matchedSkills: [
          ...gapAnalysis.matchedSkills,
          { skill: "Kubernetes", evidence: "fabricated" },
        ],
      },
    };
    const result = noHallucinatedMatches!(run, expected);
    expect(result.score).toBeCloseTo(2 / 3);
  });
});

describe("scorePlausibility", () => {
  it("scores 1 when the fit score falls within the expected range", () => {
    const result = scorePlausibility!(completeRun, expected);
    expect(result.score).toBe(1);
  });

  it("scores 0 when the fit score falls outside the expected range", () => {
    const run: PipelineRunResult = {
      ...completeRun,
      gapAnalysis: { ...gapAnalysis, fitScore: 5 },
    };
    const result = scorePlausibility!(run, expected);
    expect(result.score).toBe(0);
  });
});
