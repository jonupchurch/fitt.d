# ADR-0006: Schema-validated streaming for tailoring output via a Route Handler + `useObject`

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Jon Upchurch

## Context

Feature 004's tailoring output (`TailoringOutput`) is genuine free-text
prose — rewritten bullets, a summary, a cover-letter opener — where
token-by-token streaming has real perceived-speed value, deferred here
from ADR-0004. Constitution Principle II is unconditional: all LLM
output must be Zod-validated before use, even when streamed. The
reference bundle's draft `bullet-tailoring.v1.md` prompt specified raw
`streamed_markdown` parsed by convention (section headers, "Before/
After" labels) — rejected per Principle II, same as noted in this
feature's `research.md`.

`specs/004-gap-analysis-tailoring/contracts/actions.md` sketched
`tailorResume(...)` as a **Server Action** returning
`{ stream: ReadableStream, final: Promise<Result<T>> }`. Implementing
that sketch required verifying the AI SDK's actual current streaming
API (`node_modules/ai/docs/`, `ai@7.0.15`), since `research.md`
explicitly flagged this as unconfirmed. That check surfaced two things
the plan hadn't anticipated:

1. Streaming a schema-validated object *out of a Server Action* to a
   Client Component is the domain of `@ai-sdk/rsc`'s
   `createStreamableValue`/`readStreamableValue` — and the AI SDK's own
   docs mark AI SDK RSC "currently experimental," recommending "AI SDK
   UI" for production instead. `@ai-sdk/rsc` isn't installed and isn't
   the path this project should build production behavior on.
2. The actual production-recommended pattern for this exact use case —
   stream a schema-validated object to the client — is a **Route
   Handler** using `streamText` + `Output.object({ schema })`, paired
   with the `experimental_useObject` hook from `@ai-sdk/react` (a
   different package, not yet a dependency). Reading the installed
   `@ai-sdk/react` source directly (not just its docs) confirmed
   `useObject` calls `safeValidateTypes` against the schema on the
   *complete* accumulated object once the stream closes, and reports
   `{ object: undefined, error }` on the client via `onFinish` if
   validation fails — genuine schema validation, not just TypeScript
   typing.

## Decision

`tailorResumeResponse()` (`src/lib/llm/tailor-resume.ts`) is called from
a **Route Handler** (`src/app/api/tailor-resume/route.ts`), not a
Server Action. It streams a `streamText` + `Output.object({ schema:
TailoringOutputSchema })` response via `createTextStreamResponse` +
`toTextStream`. The client (`src/app/analyze/match/page.tsx`) consumes
it with `experimental_useObject` (added `@ai-sdk/react` dependency,
version-matched to the installed `ai` package), which renders partial
content as it streams and validates the complete object via
`safeValidateTypes` before calling it final.

The "restart the whole streamed call once on validation failure, then
degrade to a clear message" retry behavior (`research.md`) lives
**client-side**: `useObject`'s `onFinish({ object, error })` callback
re-calls `submit()` with the same payload exactly once if `object` is
`undefined`, then surfaces a clear error on a second failure. A stream
can't be repaired mid-flight the way a blocking call can (ADR-0003), so
"restart the whole call" is the only meaningful retry unit here, and
the client already holds the exact payload needed to retry.

The shared per-IP rate limiter is checked inside the Route Handler
itself (identical `checkRateLimit`/`x-forwarded-for` logic to every
other analysis endpoint) — a Route Handler has the same `headers()`
access as a Server Action, so no behavior is lost by this transport
change.

## Alternatives considered

- **Build `tailorResume` as the Server-Action-returning-a-stream shape
  `contracts/actions.md` sketched, via `@ai-sdk/rsc`** — rejected: that
  package is explicitly experimental and not the AI SDK's own
  production recommendation; building new, permanent feature work on it
  would be starting from a foundation the SDK's authors themselves
  flag as unstable.
- **Raw markdown streaming parsed by convention** (the reference
  bundle's draft) — rejected per Principle II, unchanged from
  `research.md`'s reasoning.
- **A second, separate blocking call purely for validation after a
  display-only stream** — rejected: doubles model cost for output
  `useObject`'s own final-validation step already delivers in one call.
- **Server-side retry** (the Route Handler itself re-attempts
  `streamText` internally before responding) — rejected: it would
  require buffering the entire stream server-side before deciding
  whether to retry, defeating the purpose of streaming for perceived
  speed. The client already has to hold the payload to call `submit()`
  in the first place, so a client-side restart costs nothing extra and
  keeps the Route Handler a thin, single-attempt wrapper.

## Consequences

`/analyze/match` is the one route in this codebase built on a Route
Handler instead of a Server Action — a deliberate, narrow exception,
not a new default: every other analysis endpoint (JD, resume, gap)
stays a Server Action, since none of them need HTTP-level streaming.
`@ai-sdk/react` is a new dependency, version-pinned to match the
installed `ai` package exactly (`4.0.16` ships `ai: 7.0.15` as its own
dependency). Future features should default to Server Actions unless
they specifically need to stream a schema-validated object to the
client, in which case this ADR is the reference pattern to reuse
rather than re-deriving.
