/**
 * Which sitewide nav item is "active" for a given pathname. The wizard
 * spans four routes (/analyze/upload, /analyze/job, /analyze/report,
 * /analyze/match) behind a single nav item, per spec.md FR-003 — a
 * prefix check, not an exact match, unlike wizard-progress.tsx's own
 * per-step comparisons.
 */
export function isWizardRoute(pathname: string): boolean {
  return pathname.startsWith("/analyze");
}

export function isAboutRoute(pathname: string): boolean {
  return pathname === "/about";
}
