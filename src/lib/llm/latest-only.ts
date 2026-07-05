export type LatestOnlyResult<T> =
  | { stale: true }
  | { stale: false; value: T };

/**
 * Guards against an earlier in-flight async call resolving after a
 * newer one and overwriting its result (spec.md FR-004/US3: the JD
 * live-preview must never show a stale analysis). Each call to the
 * returned function bumps a token; when its task resolves, the result
 * is reported `stale` if a newer call has since been made.
 */
export function createLatestOnly<T>() {
  let currentToken = 0;

  return async function runLatestOnly(
    task: () => Promise<T>,
  ): Promise<LatestOnlyResult<T>> {
    const token = ++currentToken;
    const value = await task();
    return token === currentToken ? { stale: false, value } : { stale: true };
  };
}
