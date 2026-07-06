import { expect, test, type Page } from "@playwright/test";

function statusPanel(page: Page) {
  return page.getByRole("complementary", { name: "Wizard status" });
}

function checkpointItem(page: Page, label: string) {
  return statusPanel(page).locator("li", { hasText: label });
}

async function isDone(page: Page, label: string): Promise<boolean> {
  const text = (await checkpointItem(page, label).textContent()) ?? "";
  // The sr-only suffix is either " — done" or " — not done" — the
  // former is not a substring of the latter, so a plain includes()
  // check is unambiguous.
  return text.includes("— done");
}

test.describe("wizard status panel", () => {
  test("all four checkpoints start not-done", async ({ page }) => {
    await page.goto("/analyze/upload");
    for (const label of [
      "Resume Submitted",
      "Resume Analyzed",
      "JD Submitted",
      "fitt.d analysis",
    ]) {
      expect(await isDone(page, label)).toBe(false);
    }
  });

  test("Resume Submitted flips before Resume Analyzed, coexisting with the top progress bar", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page
      .getByLabel("Paste resume text")
      .fill("Jane Doe\nEngineer. TRIGGER_SLOW_ANALYSIS");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL("/analyze/report");

    expect(await isDone(page, "Resume Submitted")).toBe(true);
    expect(await isDone(page, "Resume Analyzed")).toBe(false);
    // Both the panel and the existing top progress bar are visible together.
    await expect(page.getByRole("list", { name: "Progress" })).toBeVisible();
    await expect(statusPanel(page)).toBeVisible();

    await expect(page.getByText("ATS / formatting checks")).toBeVisible();
    expect(await isDone(page, "Resume Analyzed")).toBe(true);
  });

  test("JD Submitted flips independent of resume-side state", async ({
    page,
  }) => {
    await page.goto("/analyze/job");
    await page
      .getByLabel("Paste the full job description")
      .fill("We need an engineer.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(
      page.getByRole("heading", { name: "Job description ready" }),
    ).toBeVisible();

    expect(await isDone(page, "JD Submitted")).toBe(true);
    expect(await isDone(page, "Resume Submitted")).toBe(false);
  });

  test("fitt.d analysis only marks done once a fit is actually computed, and persists across navigation", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page.getByLabel("Paste resume text").fill("Jane Doe\nEngineer.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText("ATS / formatting checks")).toBeVisible();

    await page.goto("/analyze/job");
    await page
      .getByLabel("Paste the full job description")
      .fill("We need a senior React and TypeScript engineer.");
    await expect(page.getByText("Required skills")).toBeVisible();

    // Both prerequisite analyses are ready, but the fit hasn't been
    // computed/viewed yet — must still read not-done.
    expect(await isDone(page, "fitt.d analysis")).toBe(false);

    await page.goto("/analyze/match");
    await expect(page.getByText("Tailored for this job")).toBeVisible();
    expect(await isDone(page, "fitt.d analysis")).toBe(true);

    await page.goto("/analyze/upload");
    expect(await isDone(page, "fitt.d analysis")).toBe(true);
  });

  test("reset requires confirmation and clears everything when confirmed", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page.getByLabel("Paste resume text").fill("Jane Doe\nEngineer.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText("ATS / formatting checks")).toBeVisible();
    expect(await isDone(page, "Resume Submitted")).toBe(true);

    // Dismiss first — nothing should change.
    page.once("dialog", (dialog) => void dialog.dismiss());
    await statusPanel(page).getByRole("button", { name: /start over/i }).click();
    await expect(page).toHaveURL("/analyze/report");
    expect(await isDone(page, "Resume Submitted")).toBe(true);

    // Confirm — everything clears and we land back at the start.
    page.once("dialog", (dialog) => void dialog.accept());
    await statusPanel(page).getByRole("button", { name: /start over/i }).click();
    await expect(page).toHaveURL("/analyze/upload");
    for (const label of [
      "Resume Submitted",
      "Resume Analyzed",
      "JD Submitted",
      "fitt.d analysis",
    ]) {
      expect(await isDone(page, label)).toBe(false);
    }
    await expect(
      page.getByRole("heading", { name: "Resume ready" }),
    ).not.toBeVisible();
  });

  test("reset works even while the resume-analysis navigation gate (ADR-0009) is actively blocking", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page
      .getByLabel("Paste resume text")
      .fill("Jane Doe\nEngineer. TRIGGER_SLOW_ANALYSIS");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL("/analyze/report");
    expect(await isDone(page, "Resume Analyzed")).toBe(false);

    page.once("dialog", (dialog) => void dialog.accept());
    await statusPanel(page).getByRole("button", { name: /start over/i }).click();
    await expect(page).toHaveURL("/analyze/upload");
  });

  test("discards applied tailoring edits along with everything else", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page
      .getByLabel("Paste resume text")
      .fill("Jane Doe\nSenior Frontend Engineer with 5 years of experience.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText("ATS / formatting checks")).toBeVisible();

    await page.goto("/analyze/job");
    await page
      .getByLabel("Paste the full job description")
      .fill("We need a senior React and TypeScript engineer.");
    await expect(page.getByText("Required skills")).toBeVisible();

    await page.goto("/analyze/match");
    await expect(page.getByText("Tailored for this job")).toBeVisible();
    await page.getByRole("button", { name: /apply to working copy/i }).click();
    await expect(page.getByText(/^✓ Applied$/)).toBeVisible();

    page.once("dialog", (dialog) => void dialog.accept());
    await statusPanel(page).getByRole("button", { name: /start over/i }).click();
    await expect(page).toHaveURL("/analyze/upload");

    await page.goto("/analyze/match");
    await expect(
      page.getByRole("link", { name: /upload your resume/i }),
    ).toBeVisible();
  });
});
