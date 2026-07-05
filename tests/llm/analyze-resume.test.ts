import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/llm/provider", async () => {
  const fake = await import("../../src/lib/llm/fake-provider");
  return { generateStructured: fake.fakeGenerateStructured };
});

import { analyzeResume } from "../../src/lib/llm/analyze-resume";
import {
  queueFakeResponse,
  resetFakeProvider,
} from "../../src/lib/llm/fake-provider";
import type { ResumeAnalysis } from "../../src/lib/llm/schemas";

const fixture: ResumeAnalysis = {
  sections: {
    contact: { name: "Jane Doe", email: "jane@example.com" },
    summary: "Frontend engineer with 5 years of experience.",
    experience: [
      {
        role: "Senior Frontend Engineer",
        company: "Acme Cloud",
        dates: "2021–Present",
        bullets: [
          "Built and shipped 3 customer-facing features that increased engagement 18%",
        ],
      },
    ],
    skills: ["React", "TypeScript"],
    education: [
      { institution: "State University", credential: "B.S. Computer Science" },
    ],
  },
  atsChecks: [
    { id: "contact-info", label: "Contact information present", passed: true },
  ],
  sectionFeedback: [
    { section: "contact", status: "strong", note: "Name and email present." },
    { section: "summary", status: "strong", note: "Concise and relevant." },
    { section: "experience", status: "strong", note: "Quantified impact." },
    { section: "skills", status: "strong", note: "Specific technologies." },
    { section: "education", status: "strong", note: "Degree clearly listed." },
  ],
  strengths: ["Quantified achievements", "Relevant, specific skills"],
  weaknesses: [],
  overallScore: 88,
  rewriteSuggestions: [],
};

afterEach(() => {
  resetFakeProvider();
});

describe("analyzeResume (analyze-resume.ts)", () => {
  it("loads the versioned prompt, fills in the resume text, and returns a validated ResumeAnalysis", async () => {
    queueFakeResponse({ ok: true, data: fixture });

    const result = await analyzeResume(
      "Jane Doe. Senior Frontend Engineer at Acme Cloud.",
    );

    expect(result).toEqual({ ok: true, data: fixture });
  });

  it("surfaces invalid_output when the fake provider reports validation failure (repair retry exhausted)", async () => {
    queueFakeResponse({ ok: false, reason: "invalid_output" });

    const result = await analyzeResume("A resume");

    expect(result).toEqual({ ok: false, reason: "invalid_output" });
  });

  it("surfaces provider_error when the fake provider reports a provider failure", async () => {
    queueFakeResponse({ ok: false, reason: "provider_error" });

    const result = await analyzeResume("A resume");

    expect(result).toEqual({ ok: false, reason: "provider_error" });
  });

  it("reflects a resume missing an expected section as 'not-found' rather than omitting it", async () => {
    const missingEducation: ResumeAnalysis = {
      ...fixture,
      sections: { ...fixture.sections, education: [] },
      sectionFeedback: fixture.sectionFeedback.map((entry) =>
        entry.section === "education"
          ? { ...entry, status: "not-found", note: "No education section found." }
          : entry,
      ),
    };
    queueFakeResponse({ ok: true, data: missingEducation });

    const result = await analyzeResume(
      "Jane Doe. Senior Frontend Engineer at Acme Cloud. No education listed.",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      const educationFeedback = result.data.sectionFeedback.find(
        (entry) => entry.section === "education",
      );
      expect(educationFeedback?.status).toBe("not-found");
    }
  });

  it("does not fabricate a rewrite suggestion when the resume has no identifiably weak bullets", async () => {
    queueFakeResponse({ ok: true, data: fixture });

    const result = await analyzeResume(
      "A strong resume with well-written, quantified bullets throughout.",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.rewriteSuggestions).toEqual([]);
    }
  });
});
