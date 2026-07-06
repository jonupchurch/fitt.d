import { z } from "zod";

const ShareSummarySchema = z.object({
  fitScore: z.number(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  rationale: z.string(),
});

export type ShareSummary = z.infer<typeof ShareSummarySchema>;

export type ShareLinkErrorCode = "malformed_link";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ShareLinkErrorCode; message: string } };

const BASE64URL_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Byte-array <-> base64url conversion using only `TextEncoder`/
 * `TextDecoder` and manual bit-packing — works identically in the
 * browser and in Node (the `/share` page decodes server-side), unlike
 * `btoa`/`Buffer`, which aren't both universally available. */
function bytesToBase64Url(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    result += BASE64URL_CHARS[b0 >> 2];
    result += BASE64URL_CHARS[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    result +=
      b1 !== undefined
        ? BASE64URL_CHARS[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)]
        : "";
    result += b2 !== undefined ? BASE64URL_CHARS[b2 & 0x3f] : "";
  }
  return result;
}

function base64UrlToBytes(encoded: string): Uint8Array {
  const lookup = new Map(BASE64URL_CHARS.split("").map((c, i) => [c, i]));
  const bytes: number[] = [];
  let buffer = 0;
  let bitsCollected = 0;

  for (const char of encoded) {
    const value = lookup.get(char);
    if (value === undefined) {
      throw new Error(`invalid base64url character: ${char}`);
    }
    buffer = (buffer << 6) | value;
    bitsCollected += 6;
    if (bitsCollected >= 8) {
      bitsCollected -= 8;
      bytes.push((buffer >> bitsCollected) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Encodes a trimmed `ShareSummary` — never raw resume/job-description
 * text — directly into a shareable URL, with no server-side storage
 * (docs/adr/0008-shareable-link-without-persistence.md). Only callable
 * client-side (`window.location.origin`), matching where it's used.
 */
export function encodeShareLink(summary: ShareSummary): string {
  const bytes = new TextEncoder().encode(JSON.stringify(summary));
  const encoded = bytesToBase64Url(bytes);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/share?d=${encoded}`;
}

/** Decodes the `d` query param back into a `ShareSummary`. Runs
 * equally well server-side (the `/share` page) or client-side. */
export function decodeShareLink(encoded: string): Result<ShareSummary> {
  try {
    const bytes = base64UrlToBytes(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    const result = ShareSummarySchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("shape mismatch");
    }
    return { ok: true, data: result.data };
  } catch {
    return {
      ok: false,
      error: {
        code: "malformed_link",
        message: "This share link looks corrupted or incomplete.",
      },
    };
  }
}
