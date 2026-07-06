import type { PipelineRunResult } from "./pipeline";

/**
 * Ground truth for one fixture (`fixtures/<name>/expected.json`),
 * matching `docs/data-model.md`'s `SampleFixture.expected` field.
 * Deliberately loose (substrings, ranges) rather than exact-match —
 * a real model's phrasing legitimately varies run to run in `--live`
 * mode; the fake-provider default run is fully deterministic and
 * satisfies the same assertions exactly.
 */
export interface ExpectedFixture {
  requiredSkillsMustInclude: string[];
  fitScoreRange: [number, number];
}

export interface ScoreResult {
  name: string;
  /** 0..1 — how well the run satisfied this criterion. */
  score: number;
  /** 0..1 — minimum passing score; `run-evals.ts` fails the build below it. */
  threshold: number;
  note: string;
}

export type Scorer = (
  run: PipelineRunResult,
  expected: ExpectedFixture,
) => ScoreResult;

function normalize(text: string): string {
  return text.toLowerCase();
}

/** Constitution Principle V, criterion 1: every stage produced
 * schema-valid output — the pipeline reached the end with no
 * provider/validation failure at any of the four stages. */
const schemaValidity: Scorer = (run) => {
  const complete = run.failedAt === undefined;
  return {
    name: "schema-validity",
    score: complete ? 1 : 0,
    threshold: 1,
    note: complete
      ? "all four stages returned schema-valid output"
      : `failed at ${run.failedAt}: ${run.failureDetail ?? "unknown reason"}`,
  };
};

/** Criterion 2: the JD analysis actually detected the skills this
 * fixture's job description explicitly calls out as required. */
const requiredSkillRecall: Scorer = (run, expected) => {
  if (!run.jdAnalysis) {
    return {
      name: "required-skill-recall",
      score: 0,
      threshold: 0.8,
      note: "pipeline did not reach jd-analysis",
    };
  }
  const detected = run.jdAnalysis.requiredSkills.map(normalize);
  const found = expected.requiredSkillsMustInclude.filter((skill) =>
    detected.some((d) => d.includes(normalize(skill))),
  );
  const score = expected.requiredSkillsMustInclude.length
    ? found.length / expected.requiredSkillsMustInclude.length
    : 1;
  return {
    name: "required-skill-recall",
    score,
    threshold: 0.8,
    note: `found ${found.length}/${expected.requiredSkillsMustInclude.length} expected required skills (${run.jdAnalysis.requiredSkills.join(", ")})`,
  };
};

/** Criterion 3: every skill the gap analysis claims as "matched" is
 * actually backed by something in the candidate's own resume — never
 * a skill invented out of thin air. */
const noHallucinatedMatches: Scorer = (run) => {
  if (!run.gapAnalysis || !run.resumeAnalysis) {
    return {
      name: "no-hallucinated-matches",
      score: 0,
      threshold: 1,
      note: "pipeline did not reach gap-analysis",
    };
  }
  const { matchedSkills } = run.gapAnalysis;
  if (matchedSkills.length === 0) {
    return {
      name: "no-hallucinated-matches",
      score: 1,
      threshold: 1,
      note: "no matched skills claimed",
    };
  }
  const resumeText = normalize(
    [
      run.resumeAnalysis.sections.skills.join(" "),
      run.resumeAnalysis.sections.summary ?? "",
      ...run.resumeAnalysis.sections.experience.flatMap((e) => e.bullets),
    ].join(" "),
  );
  const grounded = matchedSkills.filter((m) =>
    resumeText.includes(normalize(m.skill)),
  );
  return {
    name: "no-hallucinated-matches",
    score: grounded.length / matchedSkills.length,
    threshold: 1,
    note: `${grounded.length}/${matchedSkills.length} matched skills found evidence in the resume`,
  };
};

/** Criterion 4: the fit score is a plausible number for this
 * fixture, not just "any number 0-100 the schema happens to allow." */
const scorePlausibility: Scorer = (run, expected) => {
  if (!run.gapAnalysis) {
    return {
      name: "score-plausibility",
      score: 0,
      threshold: 1,
      note: "pipeline did not reach gap-analysis",
    };
  }
  const [min, max] = expected.fitScoreRange;
  const { fitScore } = run.gapAnalysis;
  const inRange = fitScore >= min && fitScore <= max;
  return {
    name: "score-plausibility",
    score: inRange ? 1 : 0,
    threshold: 1,
    note: `fitScore ${fitScore} ${inRange ? "within" : "outside"} expected range [${min}, ${max}]`,
  };
};

export const SCORERS: Scorer[] = [
  schemaValidity,
  requiredSkillRecall,
  noHallucinatedMatches,
  scorePlausibility,
];
