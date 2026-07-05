import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly. Without this, Next.js/Turbopack can
  // infer the wrong root when a stray lockfile exists in a parent directory
  // (e.g. a sibling project under D:\Codelib), which would otherwise produce
  // an "inferred workspace root" warning on every build.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
