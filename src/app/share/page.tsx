import Link from "next/link";
import { decodeShareLink } from "@/lib/share/report-link";

/**
 * Public, read-only shared report — reachable by anyone with the link,
 * no account and no original session required (spec.md FR-005). The
 * entire payload lives in the `d` query param; there is no database
 * lookup. See specs/005-comparison-export/contracts/actions.md and
 * docs/adr/0008-shareable-link-without-persistence.md.
 */
export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const result = d
    ? decodeShareLink(d)
    : {
        ok: false as const,
        error: {
          code: "malformed_link" as const,
          message: "This share link is missing its report data.",
        },
      };

  if (!result.ok) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Shared report
        </h1>
        <p role="alert" className="text-sm font-medium text-danger-strong">
          {result.error.message}
        </p>
        <Link
          href="/"
          className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Go to Fitt.d →
        </Link>
      </main>
    );
  }

  const { fitScore, matchedSkills, missingSkills, rationale } = result.data;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Shared resume-match report
        </h1>
        <p className="text-sm text-n-600">
          A read-only summary shared from Fitt.d.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-n-200 bg-white p-6">
        <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-cyan-50 font-display text-xl font-extrabold text-brand-strong">
          {fitScore}
        </span>
        <div>
          <p className="text-xs font-semibold tracking-wide text-n-600 uppercase">
            Fit score
          </p>
          <p className="text-sm text-ink">{fitScore} out of 100</p>
        </div>
      </div>

      <div className="rounded-2xl border border-n-200 bg-white p-5">
        <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
          Rationale
        </p>
        <p className="text-sm text-ink">{rationale}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Matched skills
          </p>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-brand-strong"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-n-600 uppercase">
            Missing skills
          </p>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-n-300 px-3 py-1 text-xs font-medium text-n-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="self-start rounded-full border border-brand px-6 py-3 text-sm font-semibold text-brand-strong transition-colors hover:bg-cyan-50"
      >
        Try Fitt.d yourself →
      </Link>
    </main>
  );
}
