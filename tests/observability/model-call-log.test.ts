import { afterEach, describe, expect, it, vi } from "vitest";
import {
  estimateCostUsd,
  logModelCall,
} from "../../src/lib/observability/model-call-log";

describe("estimateCostUsd", () => {
  it("computes cost from input/output token counts at the model's list price", () => {
    // anthropic/claude-haiku-4.5: $1/$5 per million input/output tokens.
    const cost = estimateCostUsd("anthropic/claude-haiku-4.5", 1_000_000, 200_000);
    expect(cost).toBeCloseTo(1 + 5 * 0.2, 5);
  });

  it("returns undefined for a model with no known price rather than guessing", () => {
    expect(estimateCostUsd("some/unknown-model", 1000, 1000)).toBeUndefined();
  });

  it("returns undefined when token counts are missing", () => {
    expect(
      estimateCostUsd("anthropic/claude-haiku-4.5", undefined, undefined),
    ).toBeUndefined();
  });
});

describe("logModelCall", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints a single structured JSON line with no prompt/response content", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    logModelCall({
      requestId: "req-1",
      phase: "jd-analysis",
      model: "anthropic/claude-haiku-4.5",
      latencyMs: 123,
      inputTokens: 500,
      outputTokens: 100,
      estimatedCostUsd: 0.001,
      outcome: "success",
    });

    expect(spy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(spy.mock.calls[0]?.[0] as string);
    expect(logged).toMatchObject({
      requestId: "req-1",
      phase: "jd-analysis",
      model: "anthropic/claude-haiku-4.5",
      latencyMs: 123,
      outcome: "success",
    });
    expect(typeof logged.ts).toBe("string");
  });
});
