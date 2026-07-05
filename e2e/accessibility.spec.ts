import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/analyze/upload", "/analyze/job"];

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
