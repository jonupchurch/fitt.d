/**
 * Fitt.d eval harness.
 *
 * Loads every fixture directory under ./fixtures, runs it through the
 * analysis pipeline, applies the scorers, prints a table, and exits
 * non-zero if any metric falls below its threshold.
 *
 *   npm run eval          # deterministic fake provider (CI default: free, no network)
 *   npm run eval -- --live   # real model, for validating prompt changes before release
 *
 * In this feature (000), there is no pipeline and no fixtures yet — the
 * harness MUST exit 0 as a clean no-op so it can be wired into CI now and
 * simply start doing real work once features 004/005 add fixtures and a
 * pipeline to call.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { SCORERS } from "./scorers";

const FIXTURES_DIR = join(__dirname, "fixtures");

function main(): void {
  if (!existsSync(FIXTURES_DIR)) {
    console.log("No fixtures directory found — nothing to evaluate. PASS.");
    process.exit(0);
  }

  const fixtures = readdirSync(FIXTURES_DIR, { withFileTypes: true }).filter(
    (entry) => entry.isDirectory(),
  );

  if (fixtures.length === 0) {
    console.log(
      "0 fixtures present (expected until features 004/005 add real ones) — nothing to evaluate. PASS.",
    );
    process.exit(0);
  }

  // Wire the real pipeline import here once it exists:
  //   import { createPipeline } from "../src/pipeline";
  console.log(`Found ${fixtures.length} fixture(s) but no pipeline is wired up yet.`);
  console.log(`Registered scorers: ${SCORERS.length}`);
  console.log("EVAL FAILED: fixtures exist but the pipeline is not implemented yet.");
  process.exit(1);
}

main();
