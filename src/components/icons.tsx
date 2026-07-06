import type { SVGProps } from "react";

/** Inlined (not <img>) so `currentColor` picks up Tailwind text-color
 * classes, per Resources/icon-resume.svg / icon-job.svg. */

export function ResumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 4h17l9 9v31H11z" />
      <path d="M28 4v9h9" />
      <circle cx="20" cy="22" r="4" />
      <path d="M14 33c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <line x1="29" y1="20" x2="33" y2="20" />
      <line x1="29" y1="25" x2="33" y2="25" />
      <line x1="15" y1="39" x2="33" y2="39" />
    </svg>
  );
}

export function JobIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="9" y="9" width="30" height="33" rx="2.5" />
      <path d="M18 9V7a2.5 2.5 0 0 1 2.5-2.5h7A2.5 2.5 0 0 1 30 7v2" />
      <rect x="17.5" y="5" width="13" height="6" rx="2" />
      <line x1="15" y1="21" x2="24" y2="21" />
      <line x1="15" y1="27" x2="33" y2="27" />
      <line x1="15" y1="33" x2="33" y2="33" />
      <path d="M27.5 18.5l2 2 3.5-3.5" />
    </svg>
  );
}

/** Small contact-link glyphs (feature 008's About page) — solid
 * currentColor marks, distinct 0-24 viewBox from the line icons above
 * since brand/contact glyphs are conventionally filled, not outlined. */

export function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </svg>
  );
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.21c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.61-3.37-1.21-3.37-1.21-.46-1.2-1.11-1.52-1.11-1.52-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.35-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.21C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}
