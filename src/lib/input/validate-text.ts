import type { Result } from "./schemas";

const DEFAULT_MAX_RESUME_CHARS = 20_000;
const DEFAULT_MAX_JD_CHARS = 12_000;

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function maxResumeChars(): number {
  return envInt("FITTD_MAX_RESUME_CHARS", DEFAULT_MAX_RESUME_CHARS);
}

export function maxJdChars(): number {
  return envInt("FITTD_MAX_JD_CHARS", DEFAULT_MAX_JD_CHARS);
}

export type ValidatedText = {
  text: string;
  sizeChars: number;
};

/**
 * Shared char-limit validation for pasted/extracted resume and job
 * description text. Rejects empty/whitespace-only input and text over
 * the configured budget (docs/non-functional.md) — never truncates.
 */
export function validateText(
  rawText: string,
  kind: "resume" | "jobDescription",
): Result<ValidatedText> {
  const text = rawText.trim();

  if (text.length === 0) {
    return {
      ok: false,
      error: {
        code: "empty_input",
        message:
          kind === "resume"
            ? "Please provide resume text before continuing."
            : "Please paste the job description before continuing.",
      },
    };
  }

  const limit = kind === "resume" ? maxResumeChars() : maxJdChars();
  if (text.length > limit) {
    return {
      ok: false,
      error: {
        code: "text_too_long",
        message:
          kind === "resume"
            ? `Your resume is too long (${text.length.toLocaleString()} characters). Please trim it to under ${limit.toLocaleString()} characters.`
            : `This job description is too long (${text.length.toLocaleString()} characters). Please trim it to under ${limit.toLocaleString()} characters.`,
      },
    };
  }

  return { ok: true, data: { text, sizeChars: text.length } };
}
