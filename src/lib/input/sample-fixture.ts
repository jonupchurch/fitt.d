"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  JobDescriptionSchema,
  ResumeSchema,
  type JobDescription,
  type Resume,
  type Result,
} from "./schemas";

const FIXTURE_DIR = path.join(process.cwd(), "evals", "fixtures", "sample-1");

/**
 * Loads the bundled sample resume + job description for the "Try a
 * sample" one-click demo (Constitution Principle IV). The same fixture
 * files back the eval harness (Constitution Principle V) — see
 * docs/data-model.md's SampleFixture entity. The `expected` field used
 * by the eval harness is intentionally not produced here; it stays a
 * separate, deferred concern (see specs/001-resume-jd-input/research.md).
 */
export async function loadSampleFixture(): Promise<
  Result<{ resume: Resume; jobDescription: JobDescription }>
> {
  try {
    const [resumeText, jobDescriptionText] = await Promise.all([
      readFile(path.join(FIXTURE_DIR, "resume.txt"), "utf-8"),
      readFile(path.join(FIXTURE_DIR, "job-description.txt"), "utf-8"),
    ]);

    const resumeTrimmed = resumeText.trim();
    const jdTrimmed = jobDescriptionText.trim();

    const resume = ResumeSchema.parse({
      rawText: resumeTrimmed,
      sourceFormat: "txt",
      sizeChars: resumeTrimmed.length,
    });

    const jobDescription = JobDescriptionSchema.parse({
      rawText: jdTrimmed,
      title: "Senior Frontend Engineer",
      company: "Acme Cloud",
      sizeChars: jdTrimmed.length,
    });

    return { ok: true, data: { resume, jobDescription } };
  } catch {
    return {
      ok: false,
      error: {
        code: "sample_fixture_unavailable",
        message:
          "We couldn't load the sample data right now. Please try uploading your own resume instead.",
      },
    };
  }
}
