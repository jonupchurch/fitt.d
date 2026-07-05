import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("ai", () => {
  class FakeNoObjectGeneratedError extends Error {
    text?: string;
    constructor(text?: string) {
      super("No object generated");
      this.name = "AI_NoObjectGeneratedError";
      this.text = text;
    }
    static isInstance(error: unknown): error is FakeNoObjectGeneratedError {
      return error instanceof FakeNoObjectGeneratedError;
    }
  }

  return {
    generateText: vi.fn(),
    Output: { object: (opts: unknown) => opts },
    NoObjectGeneratedError: FakeNoObjectGeneratedError,
  };
});

import { generateText, NoObjectGeneratedError } from "ai";
import { generateStructured } from "../../src/lib/llm/provider";

// The real NoObjectGeneratedError's constructor takes a
// { message, cause, text, response, usage, finishReason } options
// object; our lightweight runtime mock (vi.mock above) takes a plain
// string. This file only needs something the mocked
// `NoObjectGeneratedError.isInstance()` recognizes, so we construct
// through the mocked constructor via a loose cast rather than
// satisfying the real (unmocked) type.
const FakeNoObjectGeneratedError = NoObjectGeneratedError as unknown as new (
  text?: string,
) => Error;

const schema = z.object({ foo: z.string() });

describe("generateStructured (provider.ts retry behavior)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns validated data on first success", async () => {
    vi.mocked(generateText).mockResolvedValueOnce({
      output: { foo: "bar" },
    } as never);

    const result = await generateStructured({ prompt: "test", schema });

    expect(result).toEqual({ ok: true, data: { foo: "bar" } });
    expect(generateText).toHaveBeenCalledTimes(1);
  });

  it("retries once on invalid output, then succeeds", async () => {
    vi.mocked(generateText)
      .mockRejectedValueOnce(new FakeNoObjectGeneratedError("garbled text"))
      .mockResolvedValueOnce({ output: { foo: "repaired" } } as never);

    const result = await generateStructured({ prompt: "test", schema });

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true, data: { foo: "repaired" } });
  });

  it("degrades to invalid_output after the retry also fails", async () => {
    vi.mocked(generateText)
      .mockRejectedValueOnce(new FakeNoObjectGeneratedError("garbled"))
      .mockRejectedValueOnce(
        new FakeNoObjectGeneratedError("still garbled"),
      );

    const result = await generateStructured({ prompt: "test", schema });

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: false, reason: "invalid_output" });
  });

  it("degrades to provider_error on a non-schema failure, with no retry", async () => {
    vi.mocked(generateText).mockRejectedValueOnce(new Error("network down"));

    const result = await generateStructured({ prompt: "test", schema });

    expect(generateText).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, reason: "provider_error" });
  });
});
