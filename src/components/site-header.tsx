"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAboutRoute, isWizardRoute } from "@/lib/nav/active-section";

export function SiteHeader() {
  const pathname = usePathname();
  const wizardActive = isWizardRoute(pathname);
  const aboutActive = isAboutRoute(pathname);

  return (
    <header className="border-b border-n-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-extrabold text-ink"
        >
          Fitt<span className="text-brand">.</span>d
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-6 text-sm font-semibold"
        >
          <Link
            href="/analyze/upload"
            aria-current={wizardActive ? "page" : undefined}
            className={
              wizardActive
                ? "text-brand-strong"
                : "text-n-600 transition-colors hover:text-ink"
            }
          >
            Analyze
          </Link>
          <Link
            href="/about"
            aria-current={aboutActive ? "page" : undefined}
            className={
              aboutActive
                ? "text-brand-strong"
                : "text-n-600 transition-colors hover:text-ink"
            }
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
