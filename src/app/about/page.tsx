export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="font-display text-3xl font-extrabold text-ink">
        About Fitt<span className="text-brand">.</span>d
      </h1>
      <p className="text-n-700">
        Fitt.d compares your resume against a real job description and
        shows you exactly where they fit — and where they don&apos;t.
        Paste both in, and within seconds you get a resume score, ATS
        checks, a fit score against the job, and specific rewrite
        suggestions to close the gap.
      </p>
      <p className="text-n-700">
        Nothing you paste in is ever stored — every analysis happens
        in-session, in your browser tab, and is gone the moment you
        close it.
      </p>
    </main>
  );
}
