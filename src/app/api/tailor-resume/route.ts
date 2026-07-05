import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/llm/rate-limit";
import {
  GapAnalysisSchema,
  JDAnalysisSchema,
  ResumeAnalysisSchema,
} from "@/lib/llm/schemas";
import { tailorResumeResponse } from "@/lib/llm/tailor-resume";

async function requestKey(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/**
 * Streams a `TailoringOutput` to the client's `experimental_useObject`
 * hook — see docs/adr/0006-tailoring-output-streaming-validation.md
 * for why this is a Route Handler rather than the Server Action
 * `contracts/actions.md` sketched. Shares the same per-IP rate-limit
 * budget as every other analysis endpoint (docs/non-functional.md).
 */
export async function POST(request: Request): Promise<Response> {
  const key = await requestKey();
  if (!checkRateLimit(key)) {
    return new Response(
      "You're analyzing a bit fast — please wait a moment and try again.",
      { status: 429 },
    );
  }

  try {
    const body: unknown = await request.json();
    const { gapAnalysis, resumeAnalysis, jdAnalysis } = body as Record<
      string,
      unknown
    >;
    return await tailorResumeResponse(
      GapAnalysisSchema.parse(gapAnalysis),
      ResumeAnalysisSchema.parse(resumeAnalysis),
      JDAnalysisSchema.parse(jdAnalysis),
    );
  } catch {
    return new Response(
      "We couldn't start tailoring your resume right now. Please try again.",
      { status: 400 },
    );
  }
}
