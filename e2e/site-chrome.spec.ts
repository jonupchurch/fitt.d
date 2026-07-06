import { expect, test } from "@playwright/test";
import { encodeShareLink } from "../src/lib/share/report-link";

const WIZARD_ROUTES = [
  "/analyze/upload",
  "/analyze/job",
  "/analyze/report",
  "/analyze/match",
];

test.describe("sitewide header", () => {
  test("appears on the home page and every wizard step", async ({ page }) => {
    for (const route of ["/", ...WIZARD_ROUTES]) {
      await page.goto(route);
      await expect(
        page.getByRole("banner").getByRole("link", { name: /fitt\.d/i }),
      ).toBeVisible();
    }
  });

  test("logo returns to the home page from a non-home route", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page.getByRole("banner").getByRole("link", { name: /fitt\.d/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("the wizard nav item is a single element, active across all four wizard routes", async ({
    page,
  }) => {
    for (const route of WIZARD_ROUTES) {
      await page.goto(route);
      const wizardLinks = page.getByRole("banner").getByRole("link", {
        name: "Analyze",
      });
      await expect(wizardLinks).toHaveCount(1);
      await expect(wizardLinks).toHaveAttribute("aria-current", "page");
    }
  });

  test("the wizard nav item is not active on the home page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Analyze" }),
    ).not.toHaveAttribute("aria-current", "page");
  });
});

test.describe("about page", () => {
  test("reachable from the header and marks About active", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
    await expect(
      page.getByRole("banner").getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("is content-only — no interactive product controls", async ({
    page,
  }) => {
    await page.goto("/about");
    const main = page.getByRole("main");
    // Feature 008 replaced feature 006's placeholder "About Fitt.d"
    // product-description copy with a personal bio page — "Jon
    // Upchurch" is now the page's own h1.
    await expect(
      main.getByRole("heading", { name: "Jon Upchurch" }),
    ).toBeVisible();
    // Scoped to <main> — dev-mode tooling (e.g. Next.js's own dev
    // indicator) can inject its own button elsewhere on the page.
    await expect(main.locator("input")).toHaveCount(0);
    await expect(main.locator("textarea")).toHaveCount(0);
    await expect(main.getByRole("button")).toHaveCount(0);
  });
});

test.describe("sitewide footer", () => {
  test("shows a copyright notice and current version on every route, including a shared report", async ({
    page,
  }) => {
    const shareUrl = encodeShareLink({
      fitScore: 72,
      matchedSkills: ["React"],
      missingSkills: ["GraphQL"],
      rationale: "Strong overlap on core skills.",
    });

    for (const route of ["/", ...WIZARD_ROUTES, "/about", shareUrl]) {
      await page.goto(route);
      const footer = page.getByRole("contentinfo");
      await expect(
        footer.getByText(/©\s*\d{4}\s*by fitt\.d and jon upchurch/i),
      ).toBeVisible();
      await expect(footer.getByText(/current version: \S+/i)).toBeVisible();
    }
  });
});
