/**
 * Scorers for the Fitt.d eval harness.
 *
 * Each scorer takes a fixture's pipeline output plus its expectations and
 * returns a 0..1 score with a short note. Scorers never call the model —
 * they judge output that already exists. Empty in this feature (000):
 * there's no pipeline yet, so there's nothing to score. Features 004/005
 * add the real `Expected`/`PipelineOutput` shapes and scoring functions
 * (fit-score plausibility, keyword coverage, no-hallucinated-matches,
 * etc.) once `docs/data-model.md`'s GapAnalysis/TailoringOutput entities
 * are implemented.
 */

export interface ScoreResult {
  name: string;
  score: number;
  note: string;
}

export const SCORERS: Array<(output: unknown, expected: unknown) => ScoreResult> = [];
