import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { encodeShareLink } from "../src/lib/share/report-link";

const routes = [
  "/",
  "/analyze/upload",
  "/analyze/job",
  "/analyze/report",
  "/analyze/match",
  // No `d` param — exercises /share's malformed-link error state.
  "/share",
];

for (const route of routes) {
  test(`${route} has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("/analyze/job's populated live-preview panel has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/analyze/job");
  await page
    .getByLabel("Paste the full job description")
    .fill("We need a senior React and TypeScript engineer.");
  await expect(page.getByText("Required skills")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("/analyze/report's populated results (including an expanded accordion row) have no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/analyze/upload");
  await page
    .getByLabel("Paste resume text")
    .fill("Jane Doe\nSenior Frontend Engineer with 5 years of experience.");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page).toHaveURL("/analyze/report");
  await expect(
    page.getByText("ATS / formatting checks"),
  ).toBeVisible();

  await page.getByText("Contact", { exact: true }).click();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("/analyze/report's error state has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/analyze/upload");
  await page
    .getByLabel("Paste resume text")
    .fill("TRIGGER_FAKE_ERROR — force the fake provider to fail.");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page).toHaveURL("/analyze/report");
  await expect(
    page.getByText(/couldn't analyze this resume/i),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("/analyze/match's populated results (including an applied bullet) have no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/analyze/upload");
  await page
    .getByLabel("Paste resume text")
    .fill("Jane Doe\nSenior Frontend Engineer with 5 years of experience.");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page).toHaveURL("/analyze/report");
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
  await page.getByRole("button", { name: /get shareable link/i }).click();
  await expect(page.getByLabel("Shareable report link")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("/share's populated summary has no automatically detectable accessibility violations", async ({
  page,
}) => {
  const url = encodeShareLink({
    fitScore: 72,
    matchedSkills: ["React", "TypeScript"],
    missingSkills: ["GraphQL"],
    rationale: "Strong overlap on core skills, missing one nice-to-have.",
  });
  await page.goto(url);
  await expect(page.getByText("Shared resume-match report")).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("/analyze/match's error state has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/analyze/upload");
  await page.getByLabel("Paste resume text").fill("Jane Doe\nEngineer.");
  await page.getByRole("button", { name: /continue/i }).click();
  await expect(page).toHaveURL("/analyze/report");
  await expect(page.getByText("ATS / formatting checks")).toBeVisible();

  await page.goto("/analyze/job");
  await page
    .getByLabel("Paste the full job description")
    .fill("We need an engineer. trigger_gap_fake_error");
  await expect(page.getByText("Required skills")).toBeVisible();

  await page.goto("/analyze/match");
  await expect(
    page.getByText(/couldn't compare your resume to this job/i),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
