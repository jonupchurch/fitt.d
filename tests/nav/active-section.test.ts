import { describe, expect, it } from "vitest";
import { isAboutRoute, isWizardRoute } from "../../src/lib/nav/active-section";

describe("isWizardRoute", () => {
  it.each([
    "/analyze/upload",
    "/analyze/job",
    "/analyze/report",
    "/analyze/match",
  ])("is true for %s", (pathname) => {
    expect(isWizardRoute(pathname)).toBe(true);
  });

  it.each(["/", "/about", "/share"])("is false for %s", (pathname) => {
    expect(isWizardRoute(pathname)).toBe(false);
  });
});

describe("isAboutRoute", () => {
  it("is true for /about", () => {
    expect(isAboutRoute("/about")).toBe(true);
  });

  it.each(["/", "/share", "/analyze/upload"])(
    "is false for %s",
    (pathname) => {
      expect(isAboutRoute(pathname)).toBe(false);
    },
  );
});
