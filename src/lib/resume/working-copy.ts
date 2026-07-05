import type { ResumeAnalysis } from "@/lib/llm/schemas";

export type WorkingResumeCopy = {
  sections: ResumeAnalysis["sections"];
  appliedBulletIds: string[];
};

const STORAGE_KEY = "fittd.workingResumeCopy";

const listeners = new Set<() => void>();

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

/** Subscribe to changes made via this module's setters — mirrors
 * wizard-state.ts's pattern (same-tab only; sessionStorage isn't
 * shared across tabs). */
export function subscribeToWorkingCopy(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function getWorkingCopyRaw(): string | null {
  return readRaw();
}

function writeRaw(copy: WorkingResumeCopy): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  notifyListeners();
}

function parseRaw(raw: string | null): WorkingResumeCopy | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WorkingResumeCopy;
  } catch {
    return null;
  }
}

export function getWorkingCopy(): WorkingResumeCopy | null {
  return parseRaw(readRaw());
}

/** Creates the working copy from the analyzed resume's sections, once
 * tailoring output exists. Idempotent — re-visiting this screen must
 * not discard edits already applied (spec.md Edge Cases). */
export function initWorkingCopy(sections: ResumeAnalysis["sections"]): void {
  if (readRaw() !== null) return;
  writeRaw({ sections, appliedBulletIds: [] });
}

/**
 * Applies one tailored bullet rewrite: replaces its first matching
 * occurrence across the working copy's experience bullets and marks
 * it applied (spec.md FR-009/FR-010). `bulletIndex` identifies the
 * entry within `TailoringOutput.rewrittenBullets[]` — this module has
 * no other way to know which suggestion was applied, so the caller
 * passes the original/rewritten text alongside it (a small,
 * deliberate refinement of contracts/actions.md's bare
 * `applyBullet(bulletIndex)` sketch).
 */
export function applyBullet(
  bulletIndex: number,
  original: string,
  rewritten: string,
): void {
  const copy = getWorkingCopy();
  if (!copy) return;

  for (const entry of copy.sections.experience) {
    const index = entry.bullets.indexOf(original);
    if (index !== -1) {
      entry.bullets[index] = rewritten;
      break;
    }
  }

  const id = String(bulletIndex);
  if (!copy.appliedBulletIds.includes(id)) {
    copy.appliedBulletIds.push(id);
  }

  writeRaw(copy);
}

export function isApplied(bulletIndex: number): boolean {
  const copy = getWorkingCopy();
  return copy ? copy.appliedBulletIds.includes(String(bulletIndex)) : false;
}
