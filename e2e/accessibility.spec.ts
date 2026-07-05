import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/analyze/upload", "/analyze/job", "/analyze/report"];

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
  await expect(page).toHaveURL("/analyze/job");

  await page.goto("/analyze/report");
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
  await expect(page).toHaveURL("/analyze/job");

  await page.goto("/analyze/report");
  await expect(
    page.getByText(/couldn't analyze this resume/i),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
