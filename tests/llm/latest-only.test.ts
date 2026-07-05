import { describe, expect, it } from "vitest";
import { createLatestOnly } from "../../src/lib/llm/latest-only";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("createLatestOnly", () => {
  it("reports a fresh result when only one call is in flight", async () => {
    const runLatestOnly = createLatestOnly<string>();
    const result = await runLatestOnly(() => Promise.resolve("only call"));
    expect(result).toEqual({ stale: false, value: "only call" });
  });

  it("marks an earlier call stale when a newer one resolves first", async () => {
    const runLatestOnly = createLatestOnly<string>();
    const first = deferred<string>();
    const second = deferred<string>();

    const firstResultPromise = runLatestOnly(() => first.promise);
    const secondResultPromise = runLatestOnly(() => second.promise);

    // Newer call resolves first...
    second.resolve("second");
    const secondResult = await secondResultPromise;
    expect(secondResult).toEqual({ stale: false, value: "second" });

    // ...then the older call finally resolves, but must be ignored.
    first.resolve("first");
    const firstResult = await firstResultPromise;
    expect(firstResult).toEqual({ stale: true });
  });

  it("still marks an earlier call stale even when it resolves after the newer one, in order", async () => {
    const runLatestOnly = createLatestOnly<number>();
    const first = deferred<number>();

    const firstResultPromise = runLatestOnly(() => first.promise);
    const secondResultPromise = runLatestOnly(() => Promise.resolve(2));

    first.resolve(1);

    const [firstResult, secondResult] = await Promise.all([
      firstResultPromise,
      secondResultPromise,
    ]);

    expect(firstResult).toEqual({ stale: true });
    expect(secondResult).toEqual({ stale: false, value: 2 });
  });
});
