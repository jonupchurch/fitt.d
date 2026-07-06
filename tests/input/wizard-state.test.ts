import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  GapAnalysis,
  JDAnalysis,
  ResumeAnalysis,
  TailoringOutput,
} from "../../src/lib/llm/schemas";
import type { Resume } from "../../src/lib/input/schemas";
import {
  clearWizardState,
  getGapAnalysisRaw,
  getJdAnalysisRaw,
  getJobDescriptionRaw,
  getResumeAnalysisRaw,
  getResumeRaw,
  getTailoringOutputRaw,
  resetForNewJob,
  setStoredGapAnalysis,
  setStoredJdAnalysis,
  setStoredJobDescription,
  setStoredResume,
  setStoredResumeAnalysis,
  setStoredTailoringOutput,
} from "../../src/lib/input/wizard-state";

/** Minimal in-memory sessionStorage stand-in — this test cares about
 * persistence/invalidation mechanics, not schema shape (covered
 * elsewhere), so fixtures below are cast rather than fully populated. */
function createMemorySessionStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

beforeEach(() => {
  vi.stubGlobal("window", { sessionStorage: createMemorySessionStorage() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const RESUME: Resume = { rawText: "Jane Doe", sourceFormat: "paste", sizeChars: 8 };
const OTHER_RESUME: Resume = {
  rawText: "Someone else",
  sourceFormat: "paste",
  sizeChars: 12,
};
const RESUME_ANALYSIS = {} as ResumeAnalysis;
const JD_ANALYSIS = {} as JDAnalysis;
const GAP_ANALYSIS = {} as GapAnalysis;
const TAILORING_OUTPUT = {} as TailoringOutput;

describe("GapAnalysis persistence (ADR-0010)", () => {
  it("is cleared by a new setStoredResumeAnalysis call", () => {
    setStoredGapAnalysis(GAP_ANALYSIS);
    expect(getGapAnalysisRaw()).not.toBeNull();

    setStoredResumeAnalysis(RESUME_ANALYSIS);
    expect(getGapAnalysisRaw()).toBeNull();
  });

  it("is cleared by a new setStoredJdAnalysis call", () => {
    setStoredGapAnalysis(GAP_ANALYSIS);
    expect(getGapAnalysisRaw()).not.toBeNull();

    setStoredJdAnalysis(JD_ANALYSIS);
    expect(getGapAnalysisRaw()).toBeNull();
  });

  it("is cleared immediately when the resume content changes, not just once re-analyzed", () => {
    setStoredResume(RESUME);
    setStoredGapAnalysis(GAP_ANALYSIS);
    expect(getGapAnalysisRaw()).not.toBeNull();

    setStoredResume(OTHER_RESUME);
    expect(getGapAnalysisRaw()).toBeNull();
    // The window ADR-0010 calls out: resumeAnalysis is also already
    // gone at this point, before any new analysis has run.
    expect(getResumeAnalysisRaw()).toBeNull();
  });

  it("survives saving the same resume content again", () => {
    setStoredResume(RESUME);
    setStoredGapAnalysis(GAP_ANALYSIS);

    setStoredResume({ ...RESUME });
    expect(getGapAnalysisRaw()).not.toBeNull();
  });

  it("is cleared by resetForNewJob (Try another job)", () => {
    setStoredGapAnalysis(GAP_ANALYSIS);
    expect(getGapAnalysisRaw()).not.toBeNull();

    resetForNewJob();
    expect(getGapAnalysisRaw()).toBeNull();
  });
});

describe("TailoringOutput persistence (ADR-0010)", () => {
  it("is cleared by a new setStoredResumeAnalysis call", () => {
    setStoredTailoringOutput(TAILORING_OUTPUT);
    expect(getTailoringOutputRaw()).not.toBeNull();

    setStoredResumeAnalysis(RESUME_ANALYSIS);
    expect(getTailoringOutputRaw()).toBeNull();
  });

  it("is cleared by a new setStoredJdAnalysis call", () => {
    setStoredTailoringOutput(TAILORING_OUTPUT);
    expect(getTailoringOutputRaw()).not.toBeNull();

    setStoredJdAnalysis(JD_ANALYSIS);
    expect(getTailoringOutputRaw()).toBeNull();
  });

  it("is cleared immediately when the resume content changes", () => {
    setStoredResume(RESUME);
    setStoredTailoringOutput(TAILORING_OUTPUT);
    expect(getTailoringOutputRaw()).not.toBeNull();

    setStoredResume(OTHER_RESUME);
    expect(getTailoringOutputRaw()).toBeNull();
  });

  it("survives saving the same resume content again", () => {
    setStoredResume(RESUME);
    setStoredTailoringOutput(TAILORING_OUTPUT);

    setStoredResume({ ...RESUME });
    expect(getTailoringOutputRaw()).not.toBeNull();
  });

  it("is cleared by resetForNewJob (Try another job)", () => {
    setStoredTailoringOutput(TAILORING_OUTPUT);
    expect(getTailoringOutputRaw()).not.toBeNull();

    resetForNewJob();
    expect(getTailoringOutputRaw()).toBeNull();
  });
});

describe("clearWizardState", () => {
  it("clears all six wizard-state keys", () => {
    setStoredResume(RESUME);
    setStoredJobDescription({ rawText: "A job.", sizeChars: 6 });
    setStoredJdAnalysis(JD_ANALYSIS);
    setStoredResumeAnalysis(RESUME_ANALYSIS);
    setStoredGapAnalysis(GAP_ANALYSIS);
    setStoredTailoringOutput(TAILORING_OUTPUT);

    clearWizardState();

    expect(getResumeRaw()).toBeNull();
    expect(getJobDescriptionRaw()).toBeNull();
    expect(getJdAnalysisRaw()).toBeNull();
    expect(getResumeAnalysisRaw()).toBeNull();
    expect(getGapAnalysisRaw()).toBeNull();
    expect(getTailoringOutputRaw()).toBeNull();
  });
});
