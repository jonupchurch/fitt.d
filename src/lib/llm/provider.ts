import { NoObjectGeneratedError, Output, generateText } from "ai";
import type { z } from "zod";

const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

/** Exported so tailor-resume.ts's streamed call can share the same
 * model resolution instead of duplicating it. */
export function currentModel(): string {
  return process.env.FITTD_MODEL ?? DEFAULT_MODEL;
}

export type ProviderErrorReason = "invalid_output" | "provider_error";

export type ProviderResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: ProviderErrorReason };

/**
 * Schema-validated structured generation via the AI Gateway
 * (`FITTD_MODEL`, a "provider/model" string — see
 * docs/adr/0002-model-provider-abstraction.md), with one bounded
 * repair retry on invalid output (docs/adr/0003-llm-output-validation-and-retry.md).
 * Never throws — callers get a typed `ProviderResult` either way.
 */
export async function generateStructured<T>(options: {
  prompt: string;
  schema: z.ZodType<T>;
}): Promise<ProviderResult<T>> {
  const model = currentModel();

  try {
    const { output } = await generateText({
      model,
      output: Output.object({ schema: options.schema }),
      prompt: options.prompt,
    });
    return { ok: true, data: output };
  } catch (firstError) {
    if (!NoObjectGeneratedError.isInstance(firstError)) {
      // Never thrown to the caller (Result is typed, not an exception),
      // so without this the underlying cause (auth, billing, model
      // availability) is otherwise invisible in Vercel's runtime logs.
      console.error("generateStructured: provider call failed", firstError);
      return { ok: false, reason: "provider_error" };
    }

    try {
      const repairPrompt = `${options.prompt}\n\nYour previous response could not be parsed as valid JSON matching the required schema. Previous response:\n"""\n${firstError.text ?? ""}\n"""\n\nReturn ONLY corrected JSON matching the schema exactly — no extra prose.`;
      const { output } = await generateText({
        model,
        output: Output.object({ schema: options.schema }),
        prompt: repairPrompt,
      });
      return { ok: true, data: output };
    } catch (secondError) {
      if (NoObjectGeneratedError.isInstance(secondError)) {
        return { ok: false, reason: "invalid_output" };
      }
      console.error(
        "generateStructured: provider call failed on repair retry",
        secondError,
      );
      return { ok: false, reason: "provider_error" };
    }
  }
}
