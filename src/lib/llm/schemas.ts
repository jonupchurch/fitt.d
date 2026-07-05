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

const ResumeSectionNameSchema = z.enum([
  "contact",
  "summary",
  "experience",
  "skills",
  "education",
]);

/** Shape per docs/data-model.md's `ResumeAnalysis` entity. */
export const ResumeAnalysisSchema = z.object({
  sections: z.object({
    contact: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
    }),
    summary: z.string().optional(),
    experience: z.array(
      z.object({
        role: z.string(),
        company: z.string(),
        dates: z.string().optional(),
        bullets: z.array(z.string()),
      }),
    ),
    skills: z.array(z.string()),
    education: z.array(
      z.object({
        institution: z.string(),
        credential: z.string().optional(),
        dates: z.string().optional(),
      }),
    ),
  }),
  atsChecks: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      passed: z.boolean(),
      detail: z.string().optional(),
    }),
  ),
  sectionFeedback: z.array(
    z.object({
      section: ResumeSectionNameSchema,
      // "not-found" reflects spec.md FR-005: a section missing from the
      // resume is reported as such, never silently omitted.
      status: z.enum(["strong", "needs-work", "review", "not-found"]),
      note: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  overallScore: z.number().min(0).max(100),
  rewriteSuggestions: z.array(
    z.object({
      section: z.string(),
      original: z.string(),
      suggested: z.string(),
      whyStronger: z.string(),
    }),
  ),
});

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

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
