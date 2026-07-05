import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Analysis features (002+) route through this flag to a
    // deterministic fixture instead of a live model call — e2e tests
    // stay network-free per Constitution Principle V.
    // The rate limiter is keyed per-IP, but local requests have no
    // x-forwarded-for header, so every parallel worker shares one
    // "unknown" bucket — raise the ceiling so test concurrency doesn't
    // trip the same limit real per-user traffic is meant to catch
    // (that behavior is covered directly by rate-limit.test.ts).
    env: { FITTD_FAKE_PROVIDER: "true", FITTD_RATE_LIMIT_PER_MINUTE: "1000" },
  },
});
