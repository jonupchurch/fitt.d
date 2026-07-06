import { readFile } from "node:fs/promises";
import path from "node:path";
import { Output, createTextStreamResponse, streamText, toTextStream } from "ai";
import { currentModel } from "./provider";
import {
  estimateCostUsd,
  logModelCall,
} from "../observability/model-call-log";
import {
  TailoringOutputSchema,
  type GapAnalysis,
  type JDAnalysis,
  type ResumeAnalysis,
  type TailoringOutput,
} from "./schemas";

const PROMPT_PATH = path.join(
  process.cwd(),
  "prompts",
  "bullet-tailoring.v1.md",
);

function promptBody(fileContents: string): string {
  const withoutFrontmatter = fileContents.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFrontmatter.trim();
}

const TAILORING_DEV_FIXTURE: TailoringOutput = {
  rewrittenBullets: [
    {
      original: "Built things",
      rewritten:
        "Built and shipped React features adopted by 10K+ monthly active users",
      whyStronger:
        "Quantifies scope and impact instead of a vague action, echoing the job's emphasis on user-facing features.",
    },
  ],
  rewrittenSummary:
    "Senior Frontend Engineer with 5 years of experience building production React applications, bringing proven UI craft to a senior React/TypeScript role.",
  keywordsToWeave: ["react", "typescript"],
  coverLetterOpener:
    "As a Senior Frontend Engineer with five years of hands-on React and TypeScript experience, I was excited to see this opening for a senior engineer with exactly that focus.",
};

/** Splits `text` into a couple of chunks so the fake path exercises
 * the same incremental-parsing path as a real stream, rather than
 * arriving in one piece. */
function chunkedTextStream(text: string): ReadableStream<string> {
  const mid = Math.floor(text.length / 2);
  return new ReadableStream<string>({
    start(controller) {
      controller.enqueue(text.slice(0, mid));
      controller.enqueue(text.slice(mid));
      controller.close();
    },
  });
}

/**
 * Streams a `TailoringOutput` as a `Response` the client consumes via
 * `experimental_useObject` (`@ai-sdk/react`) — see
 * docs/adr/0006-tailoring-output-streaming-validation.md for why this
 * is a Route Handler rather than the Server-Action shape
 * contracts/actions.md originally sketched. Content streams for
 * perceived speed (spec.md FR-007/SC-002), but `useObject` validates
 * the complete accumulated object against `TailoringOutputSchema`
 * before treating it as final (FR-013) — never raw, unvalidated prose.
 */
export async function tailorResumeResponse(
  gapAnalysis: GapAnalysis,
  resumeAnalysis: ResumeAnalysis,
  jdAnalysis: JDAnalysis,
): Promise<Response> {
  if (process.env.FITTD_FAKE_PROVIDER === "true") {
    const shouldFail = jdAnalysis.notableSignals.includes("GAP_TRIGGER");
    const text = shouldFail
      ? '{"rewrittenBullets": [ this is not valid json'
      : JSON.stringify(TAILORING_DEV_FIXTURE);
    return createTextStreamResponse({ stream: chunkedTextStream(text) });
  }

  const template = promptBody(await readFile(PROMPT_PATH, "utf-8"));
  const prompt = template
    .replace("{{gap_analysis_json}}", JSON.stringify(gapAnalysis))
    .replace("{{resume_analysis_json}}", JSON.stringify(resumeAnalysis))
    .replace("{{jd_analysis_json}}", JSON.stringify(jdAnalysis));

  const model = currentModel();
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  const result = streamText({
    model,
    output: Output.object({ schema: TailoringOutputSchema }),
    prompt,
    // Streaming has no synchronous catch point the way generateStructured's
    // blocking call does (per ADR-0006, failures surface to the client
    // through the stream itself), so only the success path is logged here.
    onEnd: ({ usage }) => {
      logModelCall({
        requestId,
        phase: "tailoring",
        model,
        latencyMs: Date.now() - startedAt,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        estimatedCostUsd: estimateCostUsd(
          model,
          usage.inputTokens,
          usage.outputTokens,
        ),
        outcome: "success",
      });
    },
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
}
