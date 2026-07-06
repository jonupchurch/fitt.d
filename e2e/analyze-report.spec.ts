import { expect, test } from "@playwright/test";

async function submitResume(page: import("@playwright/test").Page, text: string) {
  await page.goto("/analyze/upload");
  await page.getByLabel("Paste resume text").fill(text);
  await page.getByRole("button", { name: /continue/i }).click();
  // Wait for the redirect to /analyze/report — confirms setResume's
  // sessionStorage write has actually happened before navigating away,
  // avoiding a race with the next page.goto(). Also where resume
  // analysis must resolve before the wizard unblocks further (ADR-0009).
  await expect(page).toHaveURL("/analyze/report");
}

test.describe("resume analysis report", () => {
  test("prompts to upload a resume first when none exists yet", async ({
    page,
  }) => {
    await page.goto("/analyze/report");
    await expect(
      page.getByRole("link", { name: /upload your resume/i }),
    ).toBeVisible();
  });

  test("shows a score, ATS checks, section feedback (including a not-found section), strengths/weaknesses, and a rewrite suggestion", async ({
    page,
  }) => {
    await submitResume(
      page,
      "Jane Doe\nSenior Frontend Engineer with 5 years of experience.",
    );

    await expect(page.getByText("ATS / formatting checks")).toBeVisible();
    await expect(page.getByText(/resume score: \d+ out of 100/i)).toBeVisible();

    await expect(
      page.getByText("Section-by-section feedback"),
    ).toBeVisible();
    await page.getByText("Education", { exact: true }).click();
    await expect(page.getByText("Not found", { exact: true })).toBeVisible();

    await expect(page.getByText("Strengths")).toBeVisible();
    await expect(page.getByText("Weaknesses")).toBeVisible();

    await expect(page.getByText("Rewrite suggestions")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /copy suggestion/i }),
    ).toBeVisible();
  });

  test("degrades gracefully with a clear message when the model fails", async ({
    page,
  }) => {
    await submitResume(
      page,
      "TRIGGER_FAKE_ERROR — force the fake provider to fail.",
    );

    await expect(
      page.getByText(/couldn't analyze this resume/i),
    ).toBeVisible();
    await expect(page.getByText("ATS / formatting checks")).not.toBeVisible();
  });

  test("is fully populated with no job description ever provided", async ({
    page,
  }) => {
    await submitResume(page, "Jane Doe\nSoftware Engineer.");

    await expect(page.getByText("ATS / formatting checks")).toBeVisible();
    // Never visited /analyze/job in this test — the report stands alone.
  });

  test("blocks reaching the job-description step until resume analysis resolves, then allows it (ADR-0009)", async ({
    page,
  }) => {
    await submitResume(
      page,
      "Jane Doe\nSoftware Engineer. TRIGGER_SLOW_ANALYSIS",
    );

    // Still pending: the "Job desc." progress-bar step isn't a link,
    // and a direct navigation attempt bounces back to the analysis page.
    await expect(
      page.getByRole("link", { name: /job desc\./i }),
    ).toHaveCount(0);
    await page.goto("/analyze/job");
    await expect(page).toHaveURL("/analyze/report");

    // Once analysis resolves, both paths work.
    await expect(page.getByText("ATS / formatting checks")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /job desc\./i }),
    ).toBeVisible();
    await page.goto("/analyze/job");
    await expect(page).toHaveURL("/analyze/job");
  });

  test("degrades gracefully on a failed analysis and still allows proceeding", async ({
    page,
  }) => {
    await submitResume(
      page,
      "TRIGGER_FAKE_ERROR — force the fake provider to fail.",
    );
    await expect(
      page.getByText(/couldn't analyze this resume/i),
    ).toBeVisible();

    // A failed analysis unblocks navigation too (ADR-0009) — it must
    // not be a permanent dead end.
    await page
      .getByRole("link", { name: /continue to job description/i })
      .click();
    await expect(page).toHaveURL("/analyze/job");
  });

  test("progress bar links to Resume analyzed between Upload and Job desc.", async ({
    page,
  }) => {
    await submitResume(page, "Jane Doe\nSoftware Engineer.");
    await expect(page.getByText("ATS / formatting checks")).toBeVisible();

    await page.goto("/analyze/upload");
    await page.getByRole("link", { name: /resume analyzed/i }).click();
    await expect(page).toHaveURL("/analyze/report");
  });
});
