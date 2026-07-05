"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ResumeIcon } from "@/components/icons";
import { useWizard } from "../wizard-context";
import { submitResume } from "./actions";

export default function UploadPage() {
  const router = useRouter();
  const { setResume } = useWizard();
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSubmit =
    (file !== null || pastedText.trim().length > 0) && !isSubmitting;

  function handleFiles(files: FileList | null) {
    const next = files?.[0];
    if (next) {
      setFile(next);
      setPastedText("");
      setError(null);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    if (file) {
      formData.set("file", file);
    } else {
      formData.set("text", pastedText);
    }

    const result = await submitResume(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setResume(result.data);
    router.push("/analyze/job");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <ResumeIcon className="h-8 w-8 flex-none text-brand" aria-hidden="true" />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Upload your resume
          </h1>
          <p className="text-sm text-n-600">
            PDF, DOCX, or TXT — or paste the text directly below.
          </p>
        </div>
      </div>

      <div
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging ? "border-brand bg-cyan-50" : "border-n-300 bg-n-50"
        }`}
      >
        <p className="font-semibold text-ink">
          {file ? file.name : "Drag and drop your resume here"}
        </p>
        <p className="text-sm text-n-600">PDF · DOCX · TXT — max 5MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand-strong transition-colors hover:bg-cyan-50"
        >
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          aria-label="Upload resume file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="sr-only"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleFiles(event.target.files)
          }
        />
      </div>

      <div className="flex items-center gap-3 text-xs font-semibold tracking-wide text-n-600 uppercase">
        <span className="h-px flex-1 bg-n-200" />
        or paste text
        <span className="h-px flex-1 bg-n-200" />
      </div>

      <textarea
        value={pastedText}
        onChange={(event) => {
          setPastedText(event.target.value);
          setFile(null);
          setError(null);
        }}
        placeholder="Paste your resume text here…"
        rows={8}
        aria-label="Paste resume text"
        className="focus:ring-brand/30 w-full rounded-xl border border-n-300 bg-white p-4 text-sm text-ink focus:border-brand focus:ring-2 focus:outline-none"
      />

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="text-xs text-n-600">
          🔒 Analyzed in-session · never stored
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-n-300"
        >
          {isSubmitting ? "Analyzing…" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
