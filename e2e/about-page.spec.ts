import { expect, test } from "@playwright/test";

test.describe("about page bio & journey", () => {
  test("shows a framed photo with meaningful alt text", async ({ page }) => {
    await page.goto("/about");
    const photo = page.getByRole("img", { name: /jon upchurch/i });
    await expect(photo).toBeVisible();
  });

  test("shows all four contact links with correct hrefs, external ones opening in a new tab", async ({
    page,
  }) => {
    await page.goto("/about");
    const main = page.getByRole("main");

    const email = main.getByRole("link", { name: /jonupchurch@gmail\.com/i });
    await expect(email).toHaveAttribute("href", "mailto:jonupchurch@gmail.com");

    const linkedin = main.getByRole("link", { name: /linkedin\.com\/in\/jonupchurch/i });
    await expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/jonupchurch/",
    );
    await expect(linkedin).toHaveAttribute("target", "_blank");
    await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");

    const github = main.getByRole("link", {
      name: "github.com/jonupchurch",
      exact: true,
    });
    await expect(github).toHaveAttribute("href", "https://github.com/jonupchurch");
    await expect(github).toHaveAttribute("target", "_blank");

    const repo = main.getByRole("link", { name: /github\.com\/jonupchurch\/fitt\.d/i });
    await expect(repo).toHaveAttribute(
      "href",
      "https://github.com/jonupchurch/fitt.d",
    );
    await expect(repo).toHaveAttribute("target", "_blank");
  });

  test("has no phone number and no resume/CV download control", async ({
    page,
  }) => {
    await page.goto("/about");
    const main = page.getByRole("main");
    await expect(main.getByText(/phone/i)).not.toBeVisible();
    await expect(
      main.getByRole("link", { name: /resume|cv|download/i }),
    ).toHaveCount(0);
    await expect(main.getByRole("button")).toHaveCount(0);
  });

  test("shows the Mission section", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "Mission" }),
    ).toBeVisible();
    await expect(
      page.getByText(/20 years of professional experience/i),
    ).toBeVisible();
  });

  test("shows the journey timeline with real milestone content in order", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "The journey to get here" }),
    ).toBeVisible();

    const headings = page.getByRole("heading", { level: 3 });
    await expect(headings).toHaveCount(8);
    await expect(headings.first()).toHaveText(
      "Writing the rules before writing any code",
    );
    await expect(headings.last()).toHaveText("Where things stand today");
  });

  test("stacks into a single legible column at a narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    await expect(
      page.getByRole("img", { name: /jon upchurch/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The journey to get here" }),
    ).toBeVisible();
  });
});
