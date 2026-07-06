import { describe, expect, it } from "vitest";
import { buildTailoredResumeDocx } from "../../src/lib/export/build-docx";
import type { WorkingResumeCopy } from "../../src/lib/resume/working-copy";

const workingCopy: WorkingResumeCopy = {
  sections: {
    contact: { name: "Jane Doe", email: "jane@example.com" },
    summary: "Frontend engineer.",
    experience: [
      {
        role: "Senior Frontend Engineer",
        company: "Acme Cloud",
        dates: "2021–Present",
        bullets: ["Built and shipped features used by 10K+ users"],
      },
    ],
    skills: ["React", "TypeScript"],
    education: [
      { institution: "State University", credential: "B.S. Computer Science" },
    ],
  },
  appliedBulletIds: ["0"],
};

/** .docx is a ZIP archive (OOXML) — checking the ZIP local-file-header
 * signature is a lightweight, meaningful "is this a real document"
 * check without needing a full OOXML parser. */
async function isValidZip(blob: Blob): Promise<boolean> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  return buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b;
}

describe("buildTailoredResumeDocx", () => {
  it("produces a valid .docx reflecting an applied edit", async () => {
    const blob = await buildTailoredResumeDocx(workingCopy);
    expect(blob.size).toBeGreaterThan(0);
    expect(await isValidZip(blob)).toBe(true);
  });

  it("still produces a valid .docx when no edits have been applied", async () => {
    const original: WorkingResumeCopy = {
      ...workingCopy,
      appliedBulletIds: [],
    };
    const blob = await buildTailoredResumeDocx(original);
    expect(blob.size).toBeGreaterThan(0);
    expect(await isValidZip(blob)).toBe(true);
  });

  it("produces a valid .docx even with sparse/minimal resume content", async () => {
    const sparse: WorkingResumeCopy = {
      sections: { contact: {}, experience: [], skills: [], education: [] },
      appliedBulletIds: [],
    };
    const blob = await buildTailoredResumeDocx(sparse);
    expect(blob.size).toBeGreaterThan(0);
    expect(await isValidZip(blob)).toBe(true);
  });
});
