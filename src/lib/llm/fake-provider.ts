import type { ProviderResult } from "./provider";
import type { JDAnalysis, ResumeAnalysis } from "./schemas";

export type FakeTaskId = "jd-analysis" | "resume-analysis";

const FAKE_ERROR_TRIGGER = "trigger_fake_error";

const JD_DEV_FIXTURE: JDAnalysis = {
  requiredSkills: ["React", "TypeScript"],
  niceToHaveSkills: ["Next.js"],
  responsibilities: ["Build and maintain user-facing features"],
  inferredSeniority: "senior",
  atsKeywords: ["react", "typescript"],
  notableSignals: [],
};

const RESUME_DEV_FIXTURE: ResumeAnalysis = {
  sections: {
    contact: { name: "Jane Doe", email: "jane@example.com" },
    summary: "Frontend engineer with 5 years of experience shipping React apps.",
    experience: [
      {
        role: "Senior Frontend Engineer",
        company: "Acme Cloud",
        dates: "2021–Present",
        bullets: ["Built things", "Led a team"],
      },
    ],
    skills: ["React", "TypeScript", "Next.js"],
    education: [],
  },
  atsChecks: [
    { id: "contact-info", label: "Contact information present", passed: true },
    { id: "standard-headings", label: "Uses standard section headings", passed: true },
    {
      id: "no-tables",
      label: "Avoids tables/columns that confuse ATS parsers",
      passed: true,
    },
  ],
  sectionFeedback: [
    { section: "contact", status: "strong", note: "Name and email are both present." },
    { section: "summary", status: "strong", note: "Concise and role-relevant." },
    {
      section: "experience",
      status: "needs-work",
      note: "Bullets could use more quantified impact.",
    },
    { section: "skills", status: "strong", note: "Specific, relevant technologies listed." },
    {
      section: "education",
      status: "not-found",
      note: "No education section was found in this resume.",
    },
  ],
  strengths: ["Clear, concise summary", "Specific technical skills listed"],
  weaknesses: ["Experience bullets lack measurable impact", "No education section found"],
  overallScore: 72,
  rewriteSuggestions: [
    {
      section: "experience",
      original: "Built things",
      suggested:
        "Built and shipped 3 customer-facing features that increased engagement 18%",
      whyStronger: "Quantifies impact and specifies scope instead of a vague action.",
    },
  ],
};

/**
 * Deterministic dev/e2e stand-in used only when `FITTD_FAKE_PROVIDER=true`
 * (set by Playwright's dev server, playwright.config.ts) so e2e tests
 * exercise the real UI/Server Action path without a live model call.
 * Generalized here (feature 003) so every analysis task shares one
 * magic-phrase/fixture mechanism, keyed by task id, instead of each
 * analyze-*.ts file reinventing it. Distinct from
 * fakeGenerateStructured/queueFakeResponse below, which back Vitest's
 * `vi.mock("@/lib/llm/provider")` unit tests.
 */
export function devFakeAnalysis(
  taskId: "jd-analysis",
  text: string,
): ProviderResult<JDAnalysis>;
export function devFakeAnalysis(
  taskId: "resume-analysis",
  text: string,
): ProviderResult<ResumeAnalysis>;
export function devFakeAnalysis(
  taskId: FakeTaskId,
  text: string,
): ProviderResult<JDAnalysis> | ProviderResult<ResumeAnalysis> {
  if (text.toLowerCase().includes(FAKE_ERROR_TRIGGER)) {
    return { ok: false, reason: "invalid_output" };
  }

  if (taskId === "jd-analysis") {
    return {
      ok: true,
      data: {
        ...JD_DEV_FIXTURE,
        notableSignals: text.toLowerCase().includes("kubernetes")
          ? ["Mentions Kubernetes"]
          : [],
      },
    };
  }

  return { ok: true, data: RESUME_DEV_FIXTURE };
}

type Queued<T> =
  | ProviderResult<T>
  | (() => ProviderResult<T> | Promise<ProviderResult<T>>);

const queue: Queued<unknown>[] = [];

/**
 * Deterministic drop-in for `provider.ts`'s `generateStructured` — no
 * network, no cost (Constitution Principle V). Tests replace the real
 * provider with this via `vi.mock("@/lib/llm/provider", ...)` and queue
 * up canned responses beforehand with `queueFakeResponse`.
 */
export async function fakeGenerateStructured<T>(): Promise<ProviderResult<T>> {
  const next = queue.shift();
  if (next === undefined) {
    throw new Error(
      "fakeGenerateStructured called with no queued response — call queueFakeResponse first.",
    );
  }
  return typeof next === "function"
    ? await (next as () => ProviderResult<T> | Promise<ProviderResult<T>>)()
    : (next as ProviderResult<T>);
}

/** Queues a canned response (or a function producing one) for the next
 * call to `fakeGenerateStructured`. FIFO — queue several to cover a
 * retry sequence. */
export function queueFakeResponse<T>(response: Queued<T>): void {
  queue.push(response as Queued<unknown>);
}

/** Clears any unconsumed queued responses. Call in `afterEach`. */
export function resetFakeProvider(): void {
  queue.length = 0;
}
