import { type ReactNode } from "react";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  showIcon?: boolean;
}

export function ExternalLink({
  href,
  children,
  showIcon = true,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
    >
      {children}
      {showIcon && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10.5 8.5V11.5C10.5 11.7652 10.3946 12.0196 10.2071 12.2071C10.0196 12.3946 9.76522 12.5 9.5 12.5H2.5C2.23478 12.5 1.98043 12.3946 1.79289 12.2071C1.60536 12.0196 1.5 11.7652 1.5 11.5V4.5C1.5 4.23478 1.60536 3.98043 1.79289 3.79289C1.98043 3.60536 2.23478 3.5 2.5 3.5H5.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 1.5H12.5V5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 8.5L12.5 1.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </a>
  );
}
