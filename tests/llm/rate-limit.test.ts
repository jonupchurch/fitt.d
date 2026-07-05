import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "../../src/lib/llm/rate-limit";

afterEach(() => {
  resetRateLimits();
});

describe("checkRateLimit", () => {
  it("allows requests up to the default limit (6/minute)", () => {
    const now = Date.now();
    for (let i = 0; i < 6; i++) {
      expect(checkRateLimit("1.2.3.4", now)).toBe(true);
    }
  });

  it("rejects the 7th request within the same window", () => {
    const now = Date.now();
    for (let i = 0; i < 6; i++) {
      checkRateLimit("1.2.3.4", now);
    }
    expect(checkRateLimit("1.2.3.4", now)).toBe(false);
  });

  it("tracks each key independently", () => {
    const now = Date.now();
    for (let i = 0; i < 6; i++) {
      checkRateLimit("1.2.3.4", now);
    }
    expect(checkRateLimit("1.2.3.4", now)).toBe(false);
    expect(checkRateLimit("5.6.7.8", now)).toBe(true);
  });

  it("resets the window after 60 seconds", () => {
    const now = Date.now();
    for (let i = 0; i < 6; i++) {
      checkRateLimit("1.2.3.4", now);
    }
    expect(checkRateLimit("1.2.3.4", now)).toBe(false);
    expect(checkRateLimit("1.2.3.4", now + 60_001)).toBe(true);
  });
});
