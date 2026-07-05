import type { ProviderResult } from "./provider";

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
