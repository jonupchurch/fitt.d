import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyBullet,
  getWorkingCopy,
  initWorkingCopy,
  isApplied,
} from "../../src/lib/resume/working-copy";
import type { ResumeAnalysis } from "../../src/lib/llm/schemas";

const sections: ResumeAnalysis["sections"] = {
  contact: { name: "Jane Doe" },
  summary: "Frontend engineer.",
  experience: [
    {
      role: "Senior Frontend Engineer",
      company: "Acme Cloud",
      bullets: ["Built things", "Led a team"],
    },
  ],
  skills: ["React"],
  education: [],
};

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("working-copy.ts", () => {
  it("initializes the working copy from the resume's sections with no bullets applied yet", () => {
    initWorkingCopy(sections);

    const copy = getWorkingCopy();
    expect(copy?.sections).toEqual(sections);
    expect(copy?.appliedBulletIds).toEqual([]);
  });

  it("is idempotent — re-initializing does not discard already-applied edits", () => {
    initWorkingCopy(sections);
    applyBullet(0, "Built things", "Shipped 3 features used by 10K+ users");

    initWorkingCopy(sections);

    expect(isApplied(0)).toBe(true);
    expect(getWorkingCopy()?.sections.experience[0]?.bullets[0]).toBe(
      "Shipped 3 features used by 10K+ users",
    );
  });

  it("applyBullet replaces the matching bullet text and marks it applied", () => {
    initWorkingCopy(sections);

    expect(isApplied(0)).toBe(false);

    applyBullet(0, "Built things", "Shipped 3 features used by 10K+ users");

    expect(isApplied(0)).toBe(true);
    expect(isApplied(1)).toBe(false);
    expect(getWorkingCopy()?.sections.experience[0]?.bullets).toEqual([
      "Shipped 3 features used by 10K+ users",
      "Led a team",
    ]);
  });

  it("marks a bullet applied even if its exact original text can no longer be found (already replaced)", () => {
    initWorkingCopy(sections);

    applyBullet(2, "Some bullet text not present in this resume", "Rewritten");

    expect(isApplied(2)).toBe(true);
    // Section content is unchanged since no match was found.
    expect(getWorkingCopy()?.sections.experience[0]?.bullets).toEqual(
      sections.experience[0]?.bullets,
    );
  });
});
