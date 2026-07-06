import type { ComponentType, SVGProps } from "react";
import { EmailIcon, GitHubIcon, LinkedInIcon } from "@/components/icons";

type ContactLink = {
  label: string;
  href: string;
  display: string;
  external: boolean;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const EMAIL = "jonupchurch@gmail.com";

const LINKS: ContactLink[] = [
  {
    label: "Email",
    href: `mailto:${EMAIL}`,
    display: EMAIL,
    external: false,
    icon: EmailIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jonupchurch/",
    display: "linkedin.com/in/jonupchurch",
    external: true,
    icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/jonupchurch",
    display: "github.com/jonupchurch",
    external: true,
    icon: GitHubIcon,
  },
  {
    label: "Fitt.d repo",
    href: "https://github.com/jonupchurch/fitt.d",
    display: "github.com/jonupchurch/fitt.d",
    external: true,
    icon: GitHubIcon,
  },
];

export function ContactLinks() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Jon Upchurch
        </h1>
        <p className="text-sm text-n-600">Builder of Fitt.d</p>
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {LINKS.map((link) => (
          <li key={link.label} className="flex items-center gap-2">
            <link.icon
              aria-hidden="true"
              className="h-4 w-4 flex-none text-n-600"
            />
            <span className="font-semibold text-ink">{link.label}: </span>
            <a
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-brand-strong underline-offset-2 hover:underline"
            >
              {link.display}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
