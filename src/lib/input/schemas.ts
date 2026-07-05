import { z } from "zod";

export const ResumeSchema = z.object({
  rawText: z.string(),
  sourceFormat: z.enum(["paste", "pdf", "docx", "txt"]),
  sizeChars: z.number().int().nonnegative(),
});

export type Resume = z.infer<typeof ResumeSchema>;

export const JobDescriptionSchema = z.object({
  rawText: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  sizeChars: z.number().int().nonnegative(),
});

export type JobDescription = z.infer<typeof JobDescriptionSchema>;

export type InputErrorCode =
  | "unsupported_file_type"
  | "file_too_large"
  | "unparseable_file"
  | "text_too_long"
  | "empty_input"
  | "sample_fixture_unavailable";

export type InputError = {
  code: InputErrorCode;
  message: string;
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: InputError };
