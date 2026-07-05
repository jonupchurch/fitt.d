import Link from "next/link";
import { TrySampleButton } from "./try-sample-button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="font-display text-5xl font-extrabold tracking-tight text-ink">
        Fitt<span className="text-brand">.</span>d
      </h1>
      <p className="max-w-md text-balance text-n-600">
        Paste a resume and a job description. See exactly how well you
        fit — and get the rewrites to close the gap.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/analyze/upload"
          className="rounded-full bg-brand-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Analyze my resume
        </Link>
        <TrySampleButton />
      </div>
      <p className="text-xs text-n-600">
        🔒 Analyzed in-session · never stored · no signup required
      </p>
    </main>
  );
}
