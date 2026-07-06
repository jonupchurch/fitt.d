/**
 * Structured logging for every LLM call — docs/non-functional.md's
 * "Reliability & observability" budget (request id, phase, latency,
 * tokens, cost, outcome), one JSON line per call so Vercel's log drain
 * can be filtered/aggregated without parsing prose. Never logs prompt
 * or response content — resumes/JDs stay stateless by design
 * (Constitution Principle II). See
 * docs/adr/0011-structured-model-call-logging.md.
 */

export type ModelCallPhase =
  | "jd-analysis"
  | "resume-analysis"
  | "gap-analysis"
  | "tailoring";

export type ModelCallOutcome =
  | "success"
  | "repaired"
  | "invalid_output"
  | "provider_error";

export interface ModelCallLog {
  requestId: string;
  phase: ModelCallPhase;
  model: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd?: number;
  outcome: ModelCallOutcome;
}

// Dollars per million tokens, Vercel AI Gateway list price (zero
// markup over the provider's own price). Confirmed live against the
// Gateway API during the 2026-07-06 Haiku swap — see CHANGELOG.md.
// A model not listed here still logs token counts, just no cost
// estimate, rather than guessing at an unknown price.
const PRICING_PER_MILLION_TOKENS: Record<
  string,
  { input: number; output: number }
> = {
  "anthropic/claude-haiku-4.5": { input: 1, output: 5 },
  "anthropic/claude-sonnet-5": { input: 2, output: 10 },
};

export function estimateCostUsd(
  model: string,
  inputTokens: number | undefined,
  outputTokens: number | undefined,
): number | undefined {
  const pricing = PRICING_PER_MILLION_TOKENS[model];
  if (!pricing || inputTokens === undefined || outputTokens === undefined) {
    return undefined;
  }
  return (
    (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
  );
}

export function logModelCall(entry: ModelCallLog): void {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...entry }));
}
