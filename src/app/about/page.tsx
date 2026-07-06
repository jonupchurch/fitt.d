import { ContactLinks } from "./contact-links";
import { FramedPhoto } from "./framed-photo";
import { Timeline } from "./timeline";
import { TIMELINE_ENTRIES } from "./timeline-data";

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="lg:w-1/4">
          <FramedPhoto />
        </div>
        <div className="lg:flex-1">
          <ContactLinks />
        </div>
      </div>

      <div>
        <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
          Mission
        </h2>
        <p className="text-base leading-relaxed text-n-700">
          I&apos;m a software architect and developer with over 20 years of
          professional experience, currently exploring my next opportunity.
          I built Fitt.d specifically to demonstrate exactly how I work —
          not just what I can build, but the discipline behind it:
          planning before building, catching and fixing real problems
          along the way, and making every non-trivial decision a
          documented, deliberate one. What follows is a concrete, honest
          account of that process, not a curated highlight reel.
        </p>
      </div>

      <div>
        <h2 className="mb-6 font-display text-2xl font-extrabold text-ink">
          The journey to get here
        </h2>
        <Timeline entries={TIMELINE_ENTRIES} />
      </div>
    </main>
  );
}
