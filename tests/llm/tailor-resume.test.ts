import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { tailorResumeResponse } from "../../src/lib/llm/tailor-resume";
import type {
  GapAnalysis,
  JDAnalysis,
  ResumeAnalysis,
} from "../../src/lib/llm/schemas";
import { TailoringOutputSchema } from "../../src/lib/llm/schemas";

const jdAnalysis: JDAnalysis = {
  requiredSkills: ["React", "TypeScript"],
  niceToHaveSkills: ["Next.js"],
  responsibilities: ["Build and maintain frontend applications"],
  inferredSeniority: "senior",
  atsKeywords: ["react", "typescript"],
  notableSignals: [],
};

const resumeAnalysis: ResumeAnalysis = {
  sections: {
    contact: { name: "Jane Doe" },
    summary: "Frontend engineer.",
    experience: [
      {
        role: "Senior Frontend Engineer",
        company: "Acme Cloud",
        bullets: ["Built things"],
      },
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
  matchedSkills: [{ skill: "React", evidence: "Listed" }],
  missingSkills: [],
  keywordCoverage: { covered: ["react"], missing: [] },
  rationale: "Good match.",
  closingAdvice: [],
};

describe("tailorResumeResponse (tailor-resume.ts, fake provider path)", () => {
  beforeEach(() => {
    process.env.FITTD_FAKE_PROVIDER = "true";
  });

  afterEach(() => {
    delete process.env.FITTD_FAKE_PROVIDER;
  });

  it("streams a TailoringOutput that validates against the schema and matches the fixture exactly (no fabricated extras)", async () => {
    const response = await tailorResumeResponse(
      gapAnalysis,
      resumeAnalysis,
      jdAnalysis,
    );
    const text = await response.text();
    const parsed = TailoringOutputSchema.parse(JSON.parse(text));

    expect(parsed.rewrittenBullets).toHaveLength(1);
    expect(parsed.rewrittenBullets[0]?.original).toBe("Built things");
  });

  it("streams invalid content when the JDAnalysis carries the GAP_TRIGGER marker, simulating a validation failure for the client's restart-once retry", async () => {
    const response = await tailorResumeResponse(gapAnalysis, resumeAnalysis, {
      ...jdAnalysis,
      notableSignals: ["GAP_TRIGGER"],
    });
    const text = await response.text();

    expect(() => TailoringOutputSchema.parse(JSON.parse(text))).toThrow();
  });
});
