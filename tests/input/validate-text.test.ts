import { describe, expect, it } from "vitest";
import {
  maxJdChars,
  maxResumeChars,
  validateText,
} from "../../src/lib/input/validate-text";

describe("validateText", () => {
  it("rejects empty resume text", () => {
    const result = validateText("", "resume");
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "empty_input" }),
    });
  });

  it("rejects whitespace-only job description text", () => {
    const result = validateText("   \n\t  ", "jobDescription");
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "empty_input" }),
    });
  });

  it("accepts resume text at the character limit", () => {
    const text = "a".repeat(maxResumeChars());
    const result = validateText(text, "resume");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sizeChars).toBe(maxResumeChars());
    }
  });

  it("rejects resume text over the character limit", () => {
    const text = "a".repeat(maxResumeChars() + 1);
    const result = validateText(text, "resume");
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "text_too_long" }),
    });
  });

  it("accepts job description text at the character limit", () => {
    const text = "a".repeat(maxJdChars());
    const result = validateText(text, "jobDescription");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sizeChars).toBe(maxJdChars());
    }
  });

  it("rejects job description text over the character limit", () => {
    const text = "a".repeat(maxJdChars() + 1);
    const result = validateText(text, "jobDescription");
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "text_too_long" }),
    });
  });

  it("trims surrounding whitespace on success", () => {
    const result = validateText("  hello world  ", "resume");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.text).toBe("hello world");
    }
  });
});
