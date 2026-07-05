import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly. Without this, Next.js/Turbopack can
  // infer the wrong root when a stray lockfile exists in a parent directory
  // (e.g. a sibling project under D:\Codelib), which would otherwise produce
  // an "inferred workspace root" warning on every build.
  turbopack: {
    root: __dirname,
  },
  // loadSampleFixture() (src/lib/input/sample-fixture.ts) reads these at
  // request time via a dynamic path — file tracing can't always infer that
  // automatically, so the sample fixture directory is included explicitly
  // for the route ("/") that invokes it.
  outputFileTracingIncludes: {
    "/": ["./evals/fixtures/sample-1/**"],
  },
};

export default nextConfig;
