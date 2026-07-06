import { describe, expect, it } from "vitest";
import {
  decodeShareLink,
  encodeShareLink,
  type ShareSummary,
} from "../../src/lib/share/report-link";

const summary: ShareSummary = {
  fitScore: 72,
  matchedSkills: ["React", "TypeScript"],
  missingSkills: ["GraphQL"],
  rationale: "Strong overlap on core skills, missing one nice-to-have.",
};

describe("report-link.ts", () => {
  it("round-trips a ShareSummary through encode/decode", () => {
    const url = encodeShareLink(summary);
    const encoded = new URL(url, "http://localhost").searchParams.get("d");
    expect(encoded).toBeTruthy();

    const result = decodeShareLink(encoded!);
    expect(result).toEqual({ ok: true, data: summary });
  });

  it("never encodes raw resume or job-description text — only the trimmed summary fields", () => {
    const url = encodeShareLink(summary);
    expect(url).not.toContain("resume");
    expect(url).not.toContain("job");
  });

  it("returns a malformed_link error for garbage input", () => {
    const result = decodeShareLink("not-valid-base64url-json!!!");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("malformed_link");
    }
  });

  it("returns a malformed_link error when the decoded payload doesn't match the expected shape", () => {
    const wrongShape = { foo: "bar" };
    const bytes = new TextEncoder().encode(JSON.stringify(wrongShape));
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    const encoded = Buffer.from(binary, "binary")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result = decodeShareLink(encoded);
    expect(result).toEqual({
      ok: false,
      error: {
        code: "malformed_link",
        message: "This share link looks corrupted or incomplete.",
      },
    });
  });
});
