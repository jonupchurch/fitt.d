/**
 * Fitt.d eval harness (Constitution Principle V).
 *
 * Runs every fixture under ./fixtures that has an expected.json through
 * the real analysis pipeline (analyze-jd -> analyze-resume ->
 * analyze-gap -> tailor-resume, exactly as the app itself calls them —
 * see pipeline.ts), scores the result against scorers.ts, prints a
 * table, and exits non-zero if any fixture falls below its scorers'
 * thresholds.
 *
 *   npm run eval          # deterministic fake provider (CI default: free, no network)
 *   npm run eval -- --live   # real model, for validating prompt changes before release
 *
 * Fake mode forces FITTD_FAKE_PROVIDER=true regardless of the local
 * .env, so CI always runs the free/deterministic path even if a
 * developer's shell has it unset. --live clears that so the pipeline
 * calls the real Gateway with whatever credentials are already in the
 * environment — not run in CI, since it costs real tokens and isn't
 * fully deterministic (see docs/adr/0012-eval-harness-scoring-and-modes.md).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runPipeline } from "./pipeline";
import { SCORERS, type ExpectedFixture } from "./scorers";

const FIXTURES_DIR = join(__dirname, "fixtures");
const isLive = process.argv.includes("--live");

if (!isLive) {
  process.env.FITTD_FAKE_PROVIDER = "true";
}

async function main(): Promise<void> {
  if (!existsSync(FIXTURES_DIR)) {
    console.log("No fixtures directory found — nothing to evaluate. PASS.");
    process.exit(0);
  }

  const fixtureNames = readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) =>
      existsSync(join(FIXTURES_DIR, entry.name, "expected.json")),
    )
    .map((entry) => entry.name);

  if (fixtureNames.length === 0) {
    console.log("0 scorable fixtures present — nothing to evaluate. PASS.");
    process.exit(0);
  }

  console.log(
    `Running ${fixtureNames.length} fixture(s) in ${isLive ? "LIVE (real model)" : "fake-provider"} mode...\n`,
  );

  let allPassed = true;

  for (const name of fixtureNames) {
    const dir = join(FIXTURES_DIR, name);
    const resumeText = readFileSync(join(dir, "resume.txt"), "utf-8").trim();
    const jobDescriptionText = readFileSync(
      join(dir, "job-description.txt"),
      "utf-8",
    ).trim();
    const expected = JSON.parse(
      readFileSync(join(dir, "expected.json"), "utf-8"),
    ) as ExpectedFixture;

    const run = await runPipeline({ resumeText, jobDescriptionText });

    console.log(`Fixture: ${name}`);
    let fixturePassed = true;
    for (const scorer of SCORERS) {
      const result = scorer(run, expected);
      const passed = result.score >= result.threshold;
      fixturePassed = fixturePassed && passed;
      console.log(
        `  [${passed ? "PASS" : "FAIL"}] ${result.name}: ${result.score.toFixed(2)} (threshold ${result.threshold}) — ${result.note}`,
      );
    }
    console.log("");
    allPassed = allPassed && fixturePassed;
  }

  if (!allPassed) {
    console.log(
      "EVAL FAILED: one or more fixtures fell below their scoring threshold.",
    );
    process.exit(1);
  }

  console.log("EVAL PASSED.");
  process.exit(0);
}

main();
