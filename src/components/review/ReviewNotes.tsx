import { useState } from "react";

interface ReviewNotesProps {
  onSave: (body: string) => void;
  initialValue?: string;
  readonly?: boolean;
  /** Content version the note is attached to — shown as a badge when set. */
  version?: number;
}

/** Email pattern — flags common personal contact details. */
const PII_EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/** Phone pattern — international prefix, area code, and 7+ digit numbers. */
const PII_PHONE_RE =
  /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3}[\s-]?\d{3,4}/;

function containsPII(body: string): boolean {
  return PII_EMAIL_RE.test(body) || PII_PHONE_RE.test(body);
}

/**
 * Free-form review notes editor with a save action. Warns when the note
 * body looks like it contains personal information (email/phone) so
 * reviewers can mask it before persisting.
 */
export function ReviewNotes({
  onSave,
  initialValue = "",
  readonly = false,
  version,
}: ReviewNotesProps) {
  const [body, setBody] = useState(initialValue);
  const [saved, setSaved] = useState(false);

  const piiDetected = containsPII(body);
  const canSave = body.trim() !== "" && !readonly;

  const handleBodyChange = (value: string) => {
    setBody(value);
    setSaved(false);
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave(body);
    setSaved(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-ink">
          Review notes
        </h3>
        {version !== undefined && (
          <span className="font-mono text-xs text-charcoal/60">
            Version: <span className="text-trust">v{version}</span>
          </span>
        )}
      </div>

      <textarea
        value={body}
        onChange={(event) => handleBodyChange(event.target.value)}
        disabled={readonly}
        rows={5}
        placeholder="Record notes about this review item…"
        className="w-full text-sm bg-bone border border-border/70 rounded-md px-3 py-2 text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-trust/50 resize-y"
      />

      {piiDetected && (
        <p
          role="alert"
          className="text-xs text-clay bg-clay/5 border border-clay/20 rounded-md px-3 py-2"
        >
          Warning: this note may contain personal information (an email address
          or phone number). Remove or mask it before saving.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-md bg-ink text-bone hover:bg-charcoal border border-ink transition-colors duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save note
        </button>
        {saved && (
          <span
            className="font-mono text-xs text-trust"
            aria-live="polite"
          >
            Note saved.
          </span>
        )}
      </div>
    </div>
  );
}
