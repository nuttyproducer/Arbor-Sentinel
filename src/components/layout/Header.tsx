import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { mainNavItems, githubLink } from "../../data/navigation";
import logoMark from "../../assets/logo-mark.svg";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DisplayDensityToggle } from "./DisplayDensityToggle";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-paper/95 border-b border-border/50" role="banner">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem] lg:h-[5.5rem]">
          {/* Logo + wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2"
            aria-label="Accountability Atlas — Home"
          >
            <img
              src={logoMark}
              alt=""
              width={40}
              height={40}
              className="w-10 h-10 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="hidden sm:block">
              <span className="font-serif text-xl font-semibold text-ink leading-tight block">
                Accountability Atlas
              </span>
              <span className="font-mono text-[11px] font-medium tracking-[0.15em] text-charcoal/60 uppercase">
                Civic Accountability Platform
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50
                  ${isActive(item.href)
                    ? "text-ink"
                    : "text-charcoal hover:text-ink"
                  }
                `.trim()}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal hover:text-ink rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
              aria-label="Search platform records"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="hidden lg:inline">Search</span>
            </Link>
            <LanguageSwitcher />
            <DisplayDensityToggle />
            <a
              href={githubLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal hover:text-ink rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
            >
              {githubLink.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 6.5V9.5C9 9.76522 8.89464 10.0196 8.70711 10.2071C8.51957 10.3946 8.26522 10.5 8 10.5H2.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5V4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 1.5H10.5V4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.5 7.5L10.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal hover:text-ink rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile nav panel */}
        <div
          id="mobile-nav"
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-out
            ${menuOpen ? "max-h-64 pb-4" : "max-h-0"}
          `.trim()}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1 py-2 border-t border-border/30">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50
                  ${isActive(item.href) ? "text-ink bg-ink/5" : "text-charcoal hover:text-ink hover:bg-ink/3"}
                `.trim()}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-charcoal hover:text-ink rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
              onClick={closeMenu}
              aria-label="Search platform records"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Search
            </Link>
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            <div className="px-3 py-2">
              <DisplayDensityToggle />
            </div>
            <a
              href={githubLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-charcoal hover:text-ink rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
              onClick={closeMenu}
            >
              {githubLink.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 6.5V9.5C9 9.76522 8.89464 10.0196 8.70711 10.2071C8.51957 10.3946 8.26522 10.5 8 10.5H2.5C2.23478 10.5 1.98043 10.3946 1.79289 10.2071C1.60536 10.0196 1.5 9.76522 1.5 9.5V4C1.5 3.73478 1.60536 3.48043 1.79289 3.29289C1.98043 3.10536 2.23478 3 2.5 3H5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 1.5H10.5V4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.5 7.5L10.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
