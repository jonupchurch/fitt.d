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
