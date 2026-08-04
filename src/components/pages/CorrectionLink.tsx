import { Link } from "react-router-dom";

interface CorrectionLinkProps {
  label?: string;
  href?: string;
  className?: string;
}

export function CorrectionLink({
  label = "Request a correction",
  href = "/corrections",
  className = "",
}: CorrectionLinkProps) {
  return (
    <p className={`text-sm text-charcoal/60 mt-6 ${className}`}>
      <Link
        to={href}
        className="inline-flex items-center gap-1.5 text-trust hover:text-trust/80 underline underline-offset-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 rounded-sm"
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 8.5L7 5.5L4 2.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </p>
  );
}
