import { type ReactNode } from "react";
import { Link } from "react-router-dom";

interface ButtonBaseProps {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

interface ButtonAsInternalLink extends ButtonBaseProps {
  /** Internal route path — renders a React Router Link (no page reload). */
  to: string;
  href?: never;
  external?: never;
  onClick?: never;
}

interface ButtonAsExternalLink extends ButtonBaseProps {
  /** External URL — renders a normal anchor. */
  href: string;
  /** When true, opens in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  to?: never;
  onClick?: never;
}

interface ButtonAsButton extends ButtonBaseProps {
  to?: never;
  href?: never;
  external?: never;
  onClick?: () => void;
}

type ButtonProps = ButtonAsInternalLink | ButtonAsExternalLink | ButtonAsButton;

const baseClasses = `
  inline-flex items-center gap-2.5 px-7 py-3.5 text-base lg:text-lg font-medium
  rounded-md transition-colors duration-200 min-h-[44px]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2
`.trim();

const variantClasses: Record<string, string> = {
  primary:
    "bg-ink text-bone hover:bg-charcoal active:scale-[0.98]",
  secondary:
    "border border-ink text-ink bg-paper hover:bg-ink/5 active:scale-[0.98]",
  ghost:
    "text-ink bg-paper hover:bg-ink/5 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  children,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  // Internal route — use React Router Link
  if ("to" in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {children}
        {icon}
      </Link>
    );
  }

  // External URL — use native anchor
  if ("href" in props && props.href !== undefined) {
    return (
      <a
        href={props.href}
        className={classes}
        {...(props.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
        {icon}
      </a>
    );
  }

  // On-click button
  return (
    <button type="button" className={classes} onClick={props.onClick}>
      {children}
      {icon}
    </button>
  );
}

export function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExternalIcon() {
  return (
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
  );
}
