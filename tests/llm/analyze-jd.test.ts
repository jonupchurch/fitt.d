import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/llm/provider", async () => {
  const fake = await import("../../src/lib/llm/fake-provider");
  return { generateStructured: fake.fakeGenerateStructured };
});

import { analyzeJobDescription } from "../../src/lib/llm/analyze-jd";
import {
  queueFakeResponse,
  resetFakeProvider,
} from "../../src/lib/llm/fake-provider";
import type { JDAnalysis } from "../../src/lib/llm/schemas";

const fixture: JDAnalysis = {
  requiredSkills: ["React", "TypeScript"],
  niceToHaveSkills: ["Next.js"],
  responsibilities: ["Build and maintain frontend applications"],
  inferredSeniority: "senior",
  atsKeywords: ["react", "typescript"],
  notableSignals: [],
};

afterEach(() => {
  resetFakeProvider();
});

describe("analyzeJobDescription (analyze-jd.ts)", () => {
  it("loads the versioned prompt, fills in the JD text, and returns a validated JDAnalysis", async () => {
    queueFakeResponse({ ok: true, data: fixture });

    const result = await analyzeJobDescription(
      "We need a senior React/TypeScript engineer.",
    );

    expect(result).toEqual({ ok: true, data: fixture });
  });

  it("surfaces invalid_output when the fake provider reports validation failure", async () => {
    queueFakeResponse({ ok: false, reason: "invalid_output" });

    const result = await analyzeJobDescription("A job description");

    expect(result).toEqual({ ok: false, reason: "invalid_output" });
  });

  it("surfaces provider_error when the fake provider reports a provider failure", async () => {
    queueFakeResponse({ ok: false, reason: "provider_error" });

    const result = await analyzeJobDescription("A job description");

    expect(result).toEqual({ ok: false, reason: "provider_error" });
  });

  it("captures an unusual requirement as a notable signal rather than dropping it", async () => {
    const withSignal: JDAnalysis = {
      ...fixture,
      notableSignals: ["Requires an active security clearance"],
    };
    queueFakeResponse({ ok: true, data: withSignal });

    const result = await analyzeJobDescription(
      "Senior engineer role. Must hold an active security clearance.",
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.notableSignals).toContain(
        "Requires an active security clearance",
      );
    }
  });
});
