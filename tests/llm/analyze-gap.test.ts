import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/llm/provider", async () => {
  const fake = await import("../../src/lib/llm/fake-provider");
  return { generateStructured: fake.fakeGenerateStructured };
});

import { analyzeGap } from "../../src/lib/llm/analyze-gap";
import {
  queueFakeResponse,
  resetFakeProvider,
} from "../../src/lib/llm/fake-provider";
import type {
  GapAnalysis,
  JDAnalysis,
  ResumeAnalysis,
} from "../../src/lib/llm/schemas";

const jdAnalysis: JDAnalysis = {
  requiredSkills: ["React", "TypeScript", "GraphQL"],
  niceToHaveSkills: ["Next.js"],
  responsibilities: ["Build and maintain frontend applications"],
  inferredSeniority: "senior",
  atsKeywords: ["react", "typescript", "graphql"],
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

const fixture: GapAnalysis = {
  fitScore: 62,
  matchedSkills: [
    { skill: "React", evidence: "Listed under skills." },
    { skill: "TypeScript", evidence: "Listed under skills." },
  ],
  missingSkills: [{ skill: "GraphQL", priority: "must-have" }],
  keywordCoverage: { covered: ["react", "typescript"], missing: ["graphql"] },
  rationale: "Strong on two of three required skills, missing GraphQL.",
  closingAdvice: [
    {
      skill: "GraphQL",
      suggestion: "Add any GraphQL exposure, even from a side project.",
    },
  ],
};

afterEach(() => {
  resetFakeProvider();
});

describe("analyzeGap (analyze-gap.ts)", () => {
  it("loads the versioned prompt, embeds both inputs, and returns a validated GapAnalysis", async () => {
    queueFakeResponse({ ok: true, data: fixture });

    const result = await analyzeGap(jdAnalysis, resumeAnalysis);

    expect(result).toEqual({ ok: true, data: fixture });
  });

  it("surfaces invalid_output when the fake provider reports validation failure", async () => {
    queueFakeResponse({ ok: false, reason: "invalid_output" });

    const result = await analyzeGap(jdAnalysis, resumeAnalysis);

    expect(result).toEqual({ ok: false, reason: "invalid_output" });
  });

  it("surfaces provider_error when the fake provider reports a provider failure", async () => {
    queueFakeResponse({ ok: false, reason: "provider_error" });

    const result = await analyzeGap(jdAnalysis, resumeAnalysis);

    expect(result).toEqual({ ok: false, reason: "provider_error" });
  });

  it("keeps a low fit score with no skill appearing as both matched and missing when required skills are absent", async () => {
    queueFakeResponse({ ok: true, data: fixture });

    const result = await analyzeGap(jdAnalysis, resumeAnalysis);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.fitScore).toBeLessThan(75);
      const matchedNames = result.data.matchedSkills.map((s) => s.skill);
      const missingNames = result.data.missingSkills.map((s) => s.skill);
      const overlap = matchedNames.filter((name) =>
        missingNames.includes(name),
      );
      expect(overlap).toEqual([]);
    }
  });
});
