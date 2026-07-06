import { expect, test, type Page } from "@playwright/test";

async function completeBothAnalyses(
  page: Page,
  resumeText: string,
  jdText: string,
) {
  await page.goto("/analyze/upload");
  await page.getByLabel("Paste resume text").fill(resumeText);
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page).toHaveURL("/analyze/report");
  await expect(page.getByText("ATS / formatting checks")).toBeVisible();

  await page.goto("/analyze/job");
  await page.getByLabel("Paste the full job description").fill(jdText);
  await expect(page.getByText("Required skills")).toBeVisible();
}

test.describe("match & comparison", () => {
  test("prompts to upload a resume first when none exists yet", async ({
    page,
  }) => {
    await page.goto("/analyze/match");
    await expect(
      page.getByRole("link", { name: /upload your resume/i }),
    ).toBeVisible();
  });

  test("shows a waiting state naming the job-description analysis when resume analysis is ready but JD isn't", async ({
    page,
  }) => {
    // Note: with ADR-0009's hard gate, "neither analysis ready" is no
    // longer reachable at /analyze/match via normal navigation — you'd
    // be redirected back to /analyze/report first. This is the one
    // waiting-state combination still reachable (feature 004's own
    // FR-011, unaffected by ADR-0009).
    await page.goto("/analyze/upload");
    await page.getByLabel("Paste resume text").fill("Jane Doe\nEngineer.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL("/analyze/report");
    await expect(page.getByText("ATS / formatting checks")).toBeVisible();

    await page.goto("/analyze/match");
    await expect(page.getByText(/still waiting on/i)).toBeVisible();
    await expect(
      page.getByText(/the job description analysis/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /go to resume analysis/i }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: /go to job description/i }),
    ).toBeVisible();
  });

  test("shows fit score, matched/missing skills, keyword coverage, advice, and a streamed tailoring panel with a working Apply", async ({
    page,
  }) => {
    await completeBothAnalyses(
      page,
      "Jane Doe\nSenior Frontend Engineer with 5 years of experience.",
      "We need a senior React and TypeScript engineer.",
    );

    await page.goto("/analyze/match");

    await expect(
      page.getByText(/fit score: \d+ out of 100/i),
    ).toBeVisible();
    await expect(page.getByText("Rationale")).toBeVisible();
    await expect(page.getByText("Matched skills")).toBeVisible();
    await expect(page.getByText("Missing skills")).toBeVisible();
    await expect(page.getByText("Covered keywords")).toBeVisible();
    await expect(page.getByText("Closing the gap")).toBeVisible();

    await expect(page.getByText("Tailored for this job")).toBeVisible();
    await expect(page.getByText("Rewritten summary")).toBeVisible();
    await expect(page.getByText("Cover letter opener")).toBeVisible();

    const applyButton = page.getByRole("button", {
      name: /apply to working copy/i,
    });
    await expect(applyButton).toBeVisible();
    await applyButton.click();
    await expect(page.getByText(/^✓ Applied$/)).toBeVisible();
  });

  test("degrades gracefully with a clear message when gap analysis fails", async ({
    page,
  }) => {
    await completeBothAnalyses(
      page,
      "Jane Doe\nSoftware Engineer.",
      "We need an engineer. trigger_gap_fake_error",
    );

    await page.goto("/analyze/match");

    await expect(
      page.getByText(/couldn't compare your resume to this job/i),
    ).toBeVisible();
    await expect(page.getByText("Matched skills")).not.toBeVisible();
  });

  test("progress bar links to fitt.d once both analyses exist", async ({
    page,
  }) => {
    await completeBothAnalyses(
      page,
      "Jane Doe\nSoftware Engineer.",
      "We need a senior React and TypeScript engineer.",
    );

    await page.goto("/analyze/upload");
    await page.getByRole("link", { name: /fitt\.d/i }).click();
    await expect(page).toHaveURL("/analyze/match");
  });
});
