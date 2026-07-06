export type TimelineEntry = {
  title: string;
  body: string;
};

/** The real build history of Fitt.d, in order. Written for a
 * non-technical reader — plain language, no unexplained jargon. */
export const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    title: "Writing the rules before writing any code",
    body: "Before a single feature existed, we wrote a project constitution — a short, plain-language set of ground rules covering how decisions get made, what \"finished\" actually means, and the quality bar every piece of work has to clear. Every choice after this point had to pass through it.",
  },
  {
    title: "Laying the foundation first",
    body: "The very first piece of work wasn't a feature at all — it was making sure the basics were solid: automated checks that catch mistakes before they ship, accessibility checks built into the process, and a deployment pipeline that pushes changes live automatically. Everything after this stood on that foundation.",
  },
  {
    title: "Planning all five core features before building any of them",
    body: "The product's five core pieces — uploading a resume, reading a job posting, scoring the resume, comparing it against the job, and producing a final report — were each fully planned in writing, with a clear spec and a step-by-step plan, before a single one was built.",
  },
  {
    title: "Building the core, one piece at a time",
    body: "With the plans in hand, each feature was built, tested, and shipped in turn. Real problems turned up along the way — a couple of color-contrast issues that would have made text hard to read, a bug that could quietly discard a candidate's saved results — and each one was caught and fixed before moving to the next piece, not left for later.",
  },
  {
    title: "Living with the finished product — and fixing what broke",
    body: "Once the core product worked end to end, we actually used it, the way a real candidate would. That surfaced problems no amount of planning alone could catch: a step that let someone move ahead before their resume had actually finished being analyzed, a caching bug that silently re-ran a paid analysis every time a page was revisited, and a status indicator that disagreed with the navigation about whether something was actually done. Each one was diagnosed and fixed the same day, with an automated test added to prove it wouldn't quietly come back.",
  },
  {
    title: "Two more features, the same disciplined way",
    body: "Rather than bolt on new ideas ad hoc, two further additions — a proper site-wide header and footer, and a clearer status panel showing exactly what's actually been analyzed versus just reachable — went through the exact same process as the original five: a written spec first, then a plan, then the build.",
  },
  {
    title: "Choosing where to spend money wisely",
    body: "Before settling on which AI model powers the analysis, we pulled real, current pricing directly from the provider rather than guessing, and switched to a model that cuts the cost in half while staying just as capable for the kind of analysis this app actually needs.",
  },
  {
    title: "Where things stand today",
    body: "The result is a fully working product backed by an automated test suite covering both the underlying logic and the real experience in a browser, accessibility checks built into every change, and a documented reason behind every non-trivial decision along the way — the process behind the product, which is exactly what this page is here to show.",
  },
];
