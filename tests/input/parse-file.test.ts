import { describe, expect, it, vi } from "vitest";

vi.mock("unpdf", () => ({
  getDocumentProxy: vi.fn(async () => ({})),
  extractText: vi.fn(async () => ({
    text: "Extracted PDF text",
    totalPages: 1,
  })),
}));

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(async () => ({
      value: "Extracted DOCX text",
      messages: [],
    })),
  },
}));

import mammoth from "mammoth";
import { extractText } from "unpdf";
import { parseResumeFile } from "../../src/lib/input/parse-file";

function makeFile(name: string, content: string, type: string): File {
  return new File([content], name, { type });
}

describe("parseResumeFile", () => {
  it("rejects an unsupported file type", async () => {
    const file = makeFile("resume.png", "not text", "image/png");
    const result = await parseResumeFile(file);
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "unsupported_file_type" }),
    });
  });

  it("rejects a file over the 5MB size cap", async () => {
    const bigContent = "a".repeat(5 * 1024 * 1024 + 1);
    const file = makeFile("resume.txt", bigContent, "text/plain");
    const result = await parseResumeFile(file);
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "file_too_large" }),
    });
  });

  it("extracts text from a valid .txt file", async () => {
    const file = makeFile(
      "resume.txt",
      "Jane Doe\nSoftware Engineer",
      "text/plain",
    );
    const result = await parseResumeFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.sourceFormat).toBe("txt");
      expect(result.data.text).toContain("Jane Doe");
    }
  });

  it("extracts text from a valid .pdf file via unpdf", async () => {
    const file = makeFile("resume.pdf", "%PDF-1.4 fake bytes", "application/pdf");
    const result = await parseResumeFile(file);
    expect(result).toEqual({
      ok: true,
      data: { text: "Extracted PDF text", sourceFormat: "pdf" },
    });
  });

  it("extracts text from a valid .docx file via mammoth", async () => {
    const file = makeFile(
      "resume.docx",
      "fake docx bytes",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    const result = await parseResumeFile(file);
    expect(result).toEqual({
      ok: true,
      data: { text: "Extracted DOCX text", sourceFormat: "docx" },
    });
  });

  it("reports an unparseable PDF (e.g. a scanned image with no text layer)", async () => {
    vi.mocked(extractText).mockResolvedValueOnce({
      text: "",
      totalPages: 1,
    } as Awaited<ReturnType<typeof extractText>>);
    const file = makeFile("scanned.pdf", "%PDF-1.4 fake bytes", "application/pdf");
    const result = await parseResumeFile(file);
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "unparseable_file" }),
    });
  });

  it("degrades gracefully when the PDF library throws", async () => {
    vi.mocked(extractText).mockRejectedValueOnce(new Error("corrupt PDF"));
    const file = makeFile("corrupt.pdf", "not a real pdf", "application/pdf");
    const result = await parseResumeFile(file);
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "unparseable_file" }),
    });
  });

  it("reports an unparseable DOCX when mammoth returns empty text", async () => {
    vi.mocked(mammoth.extractRawText).mockResolvedValueOnce({
      value: "   ",
      messages: [],
    });
    const file = makeFile(
      "empty.docx",
      "fake docx bytes",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    const result = await parseResumeFile(file);
    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: "unparseable_file" }),
    });
  });
});
