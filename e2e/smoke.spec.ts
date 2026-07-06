import { expect, test } from "@playwright/test";

test("home route loads and renders the Fitt.d identity", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Fitt.d");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Fitt.d",
  );
});
