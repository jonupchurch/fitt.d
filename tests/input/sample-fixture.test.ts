import { describe, expect, it } from "vitest";
import { loadSampleFixture } from "../../src/lib/input/sample-fixture";
import { JobDescriptionSchema, ResumeSchema } from "../../src/lib/input/schemas";

describe("loadSampleFixture", () => {
  it("loads a sample resume and job description matching the manual-input shape", async () => {
    const result = await loadSampleFixture();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Same shape as submitResume()'s output (FR-008): a valid Resume.
    expect(() => ResumeSchema.parse(result.data.resume)).not.toThrow();
    expect(result.data.resume.sourceFormat).toBe("txt");
    expect(result.data.resume.rawText.length).toBeGreaterThan(0);
    expect(result.data.resume.sizeChars).toBe(result.data.resume.rawText.length);

    // Same shape as submitJobDescription()'s output (FR-008): a valid
    // JobDescription.
    expect(() => JobDescriptionSchema.parse(result.data.jobDescription)).not.toThrow();
    expect(result.data.jobDescription.rawText.length).toBeGreaterThan(0);
    expect(result.data.jobDescription.sizeChars).toBe(
      result.data.jobDescription.rawText.length,
    );
  });
});
