import { Link } from "react-router-dom";
import logoMark from "../../assets/logo-mark.svg";

const projectLinks = [
  { label: "Gaza Dossier", href: "/gaza-dossier" },
  { label: "Legal Tracker", href: "/legal-tracker" },
  { label: "Countries", href: "/countries" },
  { label: "Institutions", href: "/institutions" },
  { label: "Organizations", href: "/organizations" },
  { label: "Take Action", href: "/take-action" },
  { label: "Evidence Library", href: "/evidence" },
  { label: "Dossier Library", href: "/dossiers" },
  { label: "Methodology", href: "/methodology" },
  { label: "Contribute", href: "/contribute" },
  { label: "Corrections", href: "/corrections" },
];

const resourceLinks = [
  { label: "Attributions", href: "/attributions" },
  { label: "Privacy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Press", href: "/press" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const externalLinks = [
  {
    label: "GitHub Repository",
    href: "https://github.com/nuttyproducer/accountability-atlas",
    external: true,
  },
  {
    label: "Security Policy",
    href: "https://github.com/nuttyproducer/accountability-atlas/blob/main/SECURITY.md",
    external: true,
  },
  {
    label: "Contribution Guide",
    href: "https://github.com/nuttyproducer/accountability-atlas/blob/main/CONTRIBUTING.md",
    external: true,
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-bone/70" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        {/* Top grid: brand + link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoMark}
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 flex-shrink-0 opacity-90"
                aria-hidden="true"
              />
              <div>
                <span className="font-serif text-xl font-semibold text-bone/90 leading-tight block">
                  Accountability Atlas
                </span>
                <span className="font-mono text-[11px] font-medium tracking-[0.15em] text-bone/50 uppercase">
                  Civic Accountability Platform
                </span>
              </div>
            </div>
            <p className="text-base text-bone/60 leading-relaxed mt-4 max-w-xs">
              Evidence for protection. Action for accountability.
            </p>
          </div>

          {/* Project links */}
          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-bone/40 mb-4">
              Project
            </h3>
            <ul className="space-y-3">
              {projectLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-base text-bone/70 hover:text-bone transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-bone/40 mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-base text-bone/70 hover:text-bone transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* External */}
          <div>
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-bone/40 mb-4">
              External
            </h3>
            <ul className="space-y-3">
              {externalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-bone/70 hover:text-bone transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-bone/20 mb-8" aria-hidden="true" />

        {/* Trust language */}
        <div className="space-y-4 text-base text-bone/50 leading-relaxed mb-8">
          <p>
            Accountability Atlas is an independent open-source civic
            accountability project. It is not a registered NGO, charity, court,
            humanitarian organization, or formal partner of listed organizations
            unless explicitly stated.
          </p>
          <p>
            The project does not provide legal advice. It does not promote
            violence, harassment, hatred, doxing, or collective blame.
          </p>
        </div>

        {/* Legal + disclaimers */}
        <hr className="border-bone/20 mb-8" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3 text-base text-bone/60 leading-relaxed">
            <p>
              Code licensed under{" "}
              <a
                href="https://github.com/nuttyproducer/accountability-atlas/blob/main/LICENSE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bone/80 hover:text-bone underline underline-offset-2 transition-colors duration-200"
              >
                AGPL-3.0-or-later
              </a>
              . Content licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bone/80 hover:text-bone underline underline-offset-2 transition-colors duration-200"
              >
                CC BY-SA 4.0
              </a>
              .
            </p>
          </div>
          <div className="space-y-3 text-base text-bone/60 leading-relaxed">
            <p>
              This project does not provide legal advice. This is not a
              registered NGO or charity. No partnership with listed
              organizations is implied.
            </p>
          </div>
        </div>

        <p className="font-mono text-sm text-bone/40 pt-10">
          &copy; {new Date().getFullYear()} Accountability Atlas contributors.
        </p>
      </div>
    </footer>
  );
}
