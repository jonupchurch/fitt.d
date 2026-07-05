import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly. Without this, Next.js/Turbopack can
  // infer the wrong root when a stray lockfile exists in a parent directory
  // (e.g. a sibling project under D:\Codelib), which would otherwise produce
  // an "inferred workspace root" warning on every build.
  turbopack: {
    root: __dirname,
  },
  // Server Actions read these at request time via a dynamic fs path —
  // file tracing can't always infer that automatically, so the
  // directories are included explicitly for the routes that invoke them.
  // loadSampleFixture() (src/lib/input/sample-fixture.ts):
  outputFileTracingIncludes: {
    "/": ["./evals/fixtures/sample-1/**"],
    // analyzeJobDescription() (src/lib/llm/analyze-jd.ts) and
    // analyzeResume() (src/lib/llm/analyze-resume.ts) each read their
    // own versioned prompt file:
    "/analyze/job": ["./prompts/**"],
    "/analyze/report": ["./prompts/**"],
  },
};

export default nextConfig;
