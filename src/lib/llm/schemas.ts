import { z } from "zod";

/** Shape per docs/data-model.md's `JDAnalysis` entity. */
export const JDAnalysisSchema = z.object({
  requiredSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  inferredSeniority: z.enum([
    "intern",
    "junior",
    "mid",
    "senior",
    "lead",
    "staff+",
  ]),
  atsKeywords: z.array(z.string()),
  notableSignals: z.array(z.string()),
});

export type JDAnalysis = z.infer<typeof JDAnalysisSchema>;

export type AnalysisErrorCode =
  | "rate_limited"
  | "invalid_model_output"
  | "provider_unavailable"
  | "empty_input";

export type AnalysisError = {
  code: AnalysisErrorCode;
  message: string;
};

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AnalysisError };
