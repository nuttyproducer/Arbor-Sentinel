import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, LOCALE_NATIVE_NAMES } from "../../i18n/config";
import type { SupportedLocale } from "../../i18n/config";

/**
 * Keyboard-accessible language switcher.
 *
 * - Opens a dropdown on click or Enter/Space.
 * - Arrow keys navigate between options.
 * - Escape closes the dropdown.
 * - Focus is managed — closing returns focus to the trigger.
 * - Respects reduced motion.
 * - Updates localStorage via the i18n language detector.
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const currentLocale = i18n.language as SupportedLocale;

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (locale: SupportedLocale) => {
      i18n.changeLanguage(locale);
      close();
    },
    [i18n, close],
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, close]);

  // Keyboard navigation within the dropdown
  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      const items = listRef.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!items || items.length === 0) return;

      const currentIndex = Array.from(items).findIndex(
        (item) => item === document.activeElement,
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (currentIndex + 1) % items.length;
        items[next].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (currentIndex - 1 + items.length) % items.length;
        items[prev].focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1].focus();
      }
    },
    [open],
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("languageSwitcher.label")}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal hover:text-ink rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50"
      >
        <span className="font-mono text-xs uppercase" aria-hidden="true">
          {currentLocale}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={t("languageSwitcher.label")}
          onKeyDown={handleListKeyDown}
          className="absolute right-0 mt-1 w-44 bg-bone border border-border rounded-md shadow-lg z-50 py-1 focus-visible:outline-none"
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <li key={locale} role="option" aria-selected={locale === currentLocale}>
              <button
                type="button"
                onClick={() => select(locale)}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-trust/50
                  ${locale === currentLocale
                    ? "text-ink font-medium bg-trust/5"
                    : "text-charcoal hover:text-ink hover:bg-ink/3"
                  }
                `.trim()}
              >
                <span className="font-mono text-xs text-charcoal/50 mr-2 uppercase">
                  {locale}
                </span>
                {LOCALE_NATIVE_NAMES[locale]}
                {locale === currentLocale && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                    className="inline ml-2"
                  >
                    <path
                      d="M2 6.5L5 9.5L10 2.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
