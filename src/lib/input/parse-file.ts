import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import type { InputError, Result } from "./schemas";

/** Per the approved wireframe (Screen 02): "PDF · DOCX · TXT — max 5MB". */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export type ParsedFile = {
  text: string;
  sourceFormat: "pdf" | "docx" | "txt";
};

function detectFormat(file: File): "pdf" | "docx" | "txt" | null {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }
  if (file.type === "text/plain" || name.endsWith(".txt")) return "txt";
  return null;
}

function unparseableError(): InputError {
  return {
    code: "unparseable_file",
    message:
      "We couldn't read any text from that file (it may be a scanned image with no text layer). Please paste your resume text instead.",
  };
}

/**
 * Validates an uploaded resume file (type/size) and extracts its plain
 * text. Runs server-side only — PDF/DOCX parsing libraries stay off the
 * client bundle.
 */
export async function parseResumeFile(file: File): Promise<Result<ParsedFile>> {
  const format = detectFormat(file);
  if (!format) {
    return {
      ok: false,
      error: {
        code: "unsupported_file_type",
        message: "Please upload a PDF, DOCX, or TXT file.",
      },
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: {
        code: "file_too_large",
        message: "That file is too large — please upload a file under 5MB.",
      },
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (format === "txt") {
      const text = buffer.toString("utf-8");
      if (text.trim().length === 0) {
        return { ok: false, error: unparseableError() };
      }
      return { ok: true, data: { text, sourceFormat: "txt" } };
    }

    if (format === "pdf") {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      if (!text || text.trim().length === 0) {
        return { ok: false, error: unparseableError() };
      }
      return { ok: true, data: { text, sourceFormat: "pdf" } };
    }

    const { value: text } = await mammoth.extractRawText({ buffer });
    if (!text || text.trim().length === 0) {
      return { ok: false, error: unparseableError() };
    }
    return { ok: true, data: { text, sourceFormat: "docx" } };
  } catch {
    return { ok: false, error: unparseableError() };
  }
}
