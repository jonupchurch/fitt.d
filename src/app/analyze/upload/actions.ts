"use server";

import { parseResumeFile } from "@/lib/input/parse-file";
import { ResumeSchema, type Resume, type Result } from "@/lib/input/schemas";
import { validateText } from "@/lib/input/validate-text";

/**
 * Accepts either a `file` field (PDF/DOCX/TXT, ≤5MB) or a `text` field
 * (pasted resume text) and returns a normalized, validated `Resume`.
 * See specs/001-resume-jd-input/contracts/actions.md.
 */
export async function submitResume(formData: FormData): Promise<Result<Resume>> {
  const file = formData.get("file");

  if (file instanceof File && file.size > 0) {
    const parsed = await parseResumeFile(file);
    if (!parsed.ok) return parsed;

    const validated = validateText(parsed.data.text, "resume");
    if (!validated.ok) return validated;

    return {
      ok: true,
      data: ResumeSchema.parse({
        rawText: validated.data.text,
        sourceFormat: parsed.data.sourceFormat,
        sizeChars: validated.data.sizeChars,
      }),
    };
  }

  const pastedText = formData.get("text");
  const validated = validateText(
    typeof pastedText === "string" ? pastedText : "",
    "resume",
  );
  if (!validated.ok) return validated;

  return {
    ok: true,
    data: ResumeSchema.parse({
      rawText: validated.data.text,
      sourceFormat: "paste",
      sizeChars: validated.data.sizeChars,
    }),
  };
}
