import { expect, test } from "@playwright/test";

/** Builds a minimal, real, valid single-page PDF containing `text`, so
 * the upload path is exercised against a genuine PDF (via unpdf) rather
 * than only a mocked one — Vitest already covers the mocked cases. */
function buildMinimalPdf(text: string): Buffer {
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] =
    "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 300 300] /Contents 5 0 R >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  const stream = `BT /F1 18 Tf 20 250 Td (${text}) Tj ET`;
  objects[5] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;

  let out = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(out);
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(out);
  out += "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(out, "binary");
}

test.describe("resume input", () => {
  test("uploading a real .pdf resume extracts text via unpdf and reaches a ready state", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page.locator('input[type="file"]').setInputFiles({
      name: "resume.pdf",
      mimeType: "application/pdf",
      buffer: buildMinimalPdf("Jane Doe Software Engineer"),
    });
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL("/analyze/job");
  });

  test("uploading a valid .txt resume reaches a ready state", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page.locator('input[type="file"]').setInputFiles({
      name: "resume.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(
        "Jane Doe\nSoftware Engineer with 5 years of experience.",
      ),
    });
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL("/analyze/job");
  });

  test("pasting resume text reaches a ready state", async ({ page }) => {
    await page.goto("/analyze/upload");
    await page
      .getByLabel("Paste resume text")
      .fill("Jane Doe\nSoftware Engineer with 5 years of experience.");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL("/analyze/job");
  });

  test("rejects an unsupported file type with a clear error", async ({
    page,
  }) => {
    await page.goto("/analyze/upload");
    await page.locator('input[type="file"]').setInputFiles({
      name: "resume.png",
      mimeType: "image/png",
      buffer: Buffer.from("not a real image"),
    });
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText(/PDF, DOCX, or TXT/i)).toBeVisible();
  });

  test("proceed action is disabled with no input", async ({ page }) => {
    await page.goto("/analyze/upload");
    await expect(
      page.getByRole("button", { name: /continue/i }),
    ).toBeDisabled();
  });
});

test.describe("job description input", () => {
  test("pasting a job description with no optional fields reaches a ready state", async ({
    page,
  }) => {
    await page.goto("/analyze/job");
    await page
      .getByLabel("Paste the full job description")
      .fill(
        "We are looking for a Senior Frontend Engineer with React experience.",
      );
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(
      page.getByRole("heading", { name: "Job description ready" }),
    ).toBeVisible();
  });

  test("proceed action is disabled with no input", async ({ page }) => {
    await page.goto("/analyze/job");
    await expect(
      page.getByRole("button", { name: /continue/i }),
    ).toBeDisabled();
  });
});

test.describe("job description live-preview", () => {
  test("shows detected skills, seniority, and responsibilities after a pause", async ({
    page,
  }) => {
    await page.goto("/analyze/job");
    await page
      .getByLabel("Paste the full job description")
      .fill("We need a senior React and TypeScript engineer.");

    await expect(page.getByText("React", { exact: true })).toBeVisible();
    await expect(page.getByText("Required skills")).toBeVisible();
    await expect(page.getByText("senior", { exact: true })).toBeVisible();
    await expect(page.getByText("Core responsibilities")).toBeVisible();
  });

  test("does not show a result immediately on the first keystroke (debounced, not per-keystroke)", async ({
    page,
  }) => {
    await page.goto("/analyze/job");
    await page.getByLabel("Paste the full job description").pressSequentially("R");
    await expect(page.getByText("Required skills")).not.toBeVisible();
  });

  test("updates the preview when the job description is edited (no stale result)", async ({
    page,
  }) => {
    await page.goto("/analyze/job");
    const textarea = page.getByLabel("Paste the full job description");

    await textarea.fill("We need a senior React and TypeScript engineer.");
    await expect(page.getByText("Required skills")).toBeVisible();
    await expect(page.getByText("Notable signals")).not.toBeVisible();

    await textarea.fill(
      "We need a senior engineer experienced with Kubernetes.",
    );
    await expect(page.getByText("Notable signals")).toBeVisible();
    await expect(page.getByText("Mentions Kubernetes")).toBeVisible();
  });

  test("degrades gracefully with a clear message when the model fails", async ({
    page,
  }) => {
    await page.goto("/analyze/job");
    await page
      .getByLabel("Paste the full job description")
      .fill("TRIGGER_FAKE_ERROR — force the fake provider to fail.");

    await expect(
      page.getByText(/couldn't analyze this job description/i),
    ).toBeVisible();
    await expect(page.getByText("Required skills")).not.toBeVisible();
  });

  test("proceeding to the next step is not blocked by the live preview", async ({
    page,
  }) => {
    await page.goto("/analyze/job");
    await page
      .getByLabel("Paste the full job description")
      .fill("We need a senior React and TypeScript engineer.");
    // Don't wait for the preview — Continue must already be enabled.
    await expect(
      page.getByRole("button", { name: /continue/i }),
    ).toBeEnabled();
  });
});

test.describe("try a sample", () => {
  test("loads sample resume and job description with zero input", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /try a sample/i }).click();
    await expect(page).toHaveURL("/analyze/job");
    await expect(
      page.getByRole("heading", { name: "Job description ready" }),
    ).toBeVisible();
  });
});
