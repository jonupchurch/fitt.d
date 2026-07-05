"use server";

import {
  JobDescriptionSchema,
  type JobDescription,
  type Result,
} from "@/lib/input/schemas";
import { validateText } from "@/lib/input/validate-text";

/**
 * Accepts pasted job description text plus optional title/company and
 * returns a normalized, validated `JobDescription`. See
 * specs/001-resume-jd-input/contracts/actions.md.
 */
export async function submitJobDescription(
  formData: FormData,
): Promise<Result<JobDescription>> {
  const rawText = formData.get("text");
  const validated = validateText(
    typeof rawText === "string" ? rawText : "",
    "jobDescription",
  );
  if (!validated.ok) return validated;

  const title = formData.get("title");
  const company = formData.get("company");

  return {
    ok: true,
    data: JobDescriptionSchema.parse({
      rawText: validated.data.text,
      sizeChars: validated.data.sizeChars,
      title: typeof title === "string" && title.trim() ? title.trim() : undefined,
      company:
        typeof company === "string" && company.trim()
          ? company.trim()
          : undefined,
    }),
  };
}
