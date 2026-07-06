import { expect, test, type Page } from "@playwright/test";

async function completeFullFlow(
  page: Page,
  resumeText: string,
  jdText: string,
) {
  await page.goto("/analyze/upload");
  await page.getByLabel("Paste resume text").fill(resumeText);
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page).toHaveURL("/analyze/job");

  await page.goto("/analyze/report");
  await expect(page.getByText("ATS / formatting checks")).toBeVisible();

  await page.goto("/analyze/job");
  await page.getByLabel("Paste the full job description").fill(jdText);
  await expect(page.getByText("Required skills")).toBeVisible();
  // Click Continue so `JobDescription` (not just its analysis) is
  // stored — the side-by-side comparison needs the raw JD text.
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(
    page.getByRole("heading", { name: "Job description ready" }),
  ).toBeVisible();

  await page.goto("/analyze/match");
  await expect(page.getByText("Tailored for this job")).toBeVisible();
}

test.describe("comparison & export", () => {
  test("shows the side-by-side comparison, updating to reflect an applied edit", async ({
    page,
  }) => {
    await completeFullFlow(
      page,
      "Jane Doe\nSenior Frontend Engineer with 5 years of experience.",
      "We need a senior React and TypeScript engineer.",
    );

    await expect(page.getByText("Side-by-side comparison")).toBeVisible();
    await expect(page.getByText("Your resume", { exact: true })).toBeVisible();
    await expect(
      page.getByText("We need a senior React and TypeScript engineer."),
    ).toBeVisible();
    await expect(page.locator("mark").first()).toBeVisible();

    await page.getByRole("button", { name: /apply to working copy/i }).click();
    await expect(page.getByText(/^✓ Applied$/)).toBeVisible();

    // The comparison pane's resume text (not just the tailoring panel's
    // "After:" line) now reflects the applied edit.
    await expect(
      page
        .locator("p.whitespace-pre-line")
        .filter({ hasText: "Built and shipped React features" }),
    ).toBeVisible();
  });

  test("mobile viewport shows a tabbed Resume/Job description view instead of two columns", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await completeFullFlow(
      page,
      "Jane Doe\nSenior Frontend Engineer with 5 years of experience.",
      "We need a senior React and TypeScript engineer.",
    );

    const resumeTab = page.getByRole("button", { name: "Resume", exact: true });
    const jobTab = page.getByRole("button", { name: "Job description", exact: true });
    await expect(resumeTab).toBeVisible();
    await expect(jobTab).toBeVisible();

    await expect(page.getByText("Your resume", { exact: true })).toBeVisible();
    await jobTab.click();
    await expect(
      page.getByText("We need a senior React and TypeScript engineer."),
    ).toBeVisible();
  });

  test("Export report triggers the print dialog", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __printed: boolean }).__printed = false;
      window.print = () => {
        (window as unknown as { __printed: boolean }).__printed = true;
      };
    });

    await completeFullFlow(
      page,
      "Jane Doe\nSoftware Engineer.",
      "We need a senior React and TypeScript engineer.",
    );

    await page.getByRole("button", { name: /export report/i }).click();
    const printed = await page.evaluate(
      () => (window as unknown as { __printed: boolean }).__printed,
    );
    expect(printed).toBe(true);
  });

  test("generates a shareable link that renders a read-only summary with no session", async ({
    page,
    context,
  }) => {
    await completeFullFlow(
      page,
      "Jane Doe\nSoftware Engineer.",
      "We need a senior React and TypeScript engineer.",
    );

    await page.getByRole("button", { name: /get shareable link/i }).click();
    const shareInput = page.getByLabel("Shareable report link");
    await expect(shareInput).toBeVisible();
    const shareUrl = await shareInput.inputValue();
    expect(shareUrl).toContain("/share?d=");
    expect(shareUrl).not.toContain("resume");

    // A fresh, unauthenticated context — no session, no cookies.
    const freshPage = await context.browser()!.newContext().then((c) => c.newPage());
    await freshPage.goto(shareUrl);
    await expect(
      freshPage.getByText("Shared resume-match report"),
    ).toBeVisible();
    await expect(freshPage.getByText("Matched skills")).toBeVisible();
    await freshPage.close();
  });

  test("shows a clear message for a malformed share link", async ({ page }) => {
    await page.goto("/share?d=not-a-valid-payload!!!");
    await expect(
      page.getByText(/share link looks corrupted or incomplete/i),
    ).toBeVisible();
  });

  test("downloads the tailored resume as a .docx file", async ({ page }) => {
    await completeFullFlow(
      page,
      "Jane Doe\nSoftware Engineer.",
      "We need a senior React and TypeScript engineer.",
    );

    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: /download tailored resume/i })
      .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("tailored-resume.docx");
  });

  test("Try another job resets the job description while preserving the resume and its analysis", async ({
    page,
  }) => {
    await completeFullFlow(
      page,
      "Jane Doe\nSoftware Engineer.",
      "We need a senior React and TypeScript engineer.",
    );

    await page.getByRole("button", { name: /try another job/i }).click();
    await expect(page).toHaveURL("/analyze/job");
    await expect(
      page.getByRole("heading", { name: "Job description ready" }),
    ).not.toBeVisible();

    await page.goto("/analyze/upload");
    await expect(
      page.getByRole("heading", { name: "Resume ready" }),
    ).toBeVisible();
  });
});
