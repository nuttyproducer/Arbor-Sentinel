import { useState, useCallback } from "react";

interface CopyTemplateButtonProps {
  text: string;
  label?: string;
}

/** Accessible copy-to-clipboard button for template text only. */
export function CopyTemplateButton({ text, label }: CopyTemplateButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not available — silently fail; the text is still visible for manual selection.
    }
  }, [text]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border border-ink/20 bg-paper text-ink hover:bg-ink/5 active:scale-[0.98] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 min-h-[44px]"
        aria-label={label ?? "Copy template text to clipboard"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="4"
            y="4"
            width="9"
            height="10"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M3 12V3C3 2.44772 3.44772 2 4 2H10"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        {copied ? "Copied" : "Copy template"}
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="font-mono text-xs text-charcoal/50"
      >
        {copied ? "Template text copied to clipboard." : ""}
      </span>
    </div>
  );
}
