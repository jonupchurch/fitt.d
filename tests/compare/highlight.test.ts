import { describe, expect, it } from "vitest";
import { highlightMatches } from "../../src/lib/compare/highlight";

describe("highlightMatches", () => {
  it("returns the whole text as one non-highlighted segment when there are no terms", () => {
    expect(highlightMatches("Senior React Engineer", [])).toEqual([
      { text: "Senior React Engineer", highlighted: false },
    ]);
  });

  it("returns the whole text as one non-highlighted segment when no term matches", () => {
    expect(highlightMatches("Senior React Engineer", ["GraphQL"])).toEqual([
      { text: "Senior React Engineer", highlighted: false },
    ]);
  });

  it("highlights a single occurrence, splitting the surrounding text", () => {
    expect(highlightMatches("Senior React Engineer", ["React"])).toEqual([
      { text: "Senior ", highlighted: false },
      { text: "React", highlighted: true },
      { text: " Engineer", highlighted: false },
    ]);
  });

  it("highlights multiple occurrences of multiple terms", () => {
    const result = highlightMatches(
      "Built React apps. Led a React and TypeScript migration.",
      ["React", "TypeScript"],
    );
    const highlighted = result.filter((segment) => segment.highlighted);
    expect(highlighted).toHaveLength(3);
    expect(highlighted.map((s) => s.text)).toEqual([
      "React",
      "React",
      "TypeScript",
    ]);
  });

  it("matches case-insensitively", () => {
    const result = highlightMatches("Experience with REACT and typescript.", [
      "react",
      "TypeScript",
    ]);
    const highlighted = result.filter((segment) => segment.highlighted);
    expect(highlighted.map((s) => s.text)).toEqual(["REACT", "typescript"]);
  });

  it("returns an empty array for empty text", () => {
    expect(highlightMatches("", ["React"])).toEqual([]);
  });
});
