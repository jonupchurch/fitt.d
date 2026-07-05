import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("placeholder home route has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
