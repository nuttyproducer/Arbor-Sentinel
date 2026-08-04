// src/components/beta/BetaFeedbackForm.tsx
// Beta feedback form — rating, category, free text, optional screenshot.
//
// Authentication is enforced by the route guard; the form only collects the
// feedback itself. The screenshot picker is wired into the UI but files are not
// uploaded during the beta (see docs/beta-feedback-process.md).

import { useId, useRef, useState, type FormEvent } from 'react';
import { getBrowserInfo, submitFeedback } from '../../lib/beta/feedback';
import {
  FEEDBACK_CATEGORIES,
  RATING_LABELS,
  type FeedbackCategory,
  type FeedbackRating,
  type FeedbackSubmission,
} from '../../lib/beta/types';
interface BetaFeedbackFormProps {
  /** Page context recorded with the submission. Defaults to the current path. */
  pageContext?: string;
  /** Called after a successful submission. */
  onSubmitted?: (submission: FeedbackSubmission) => void;
}

type FormStatus =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success' }
  | { state: 'error'; message: string };

function rateLimitMessage(code: string): string {
  return code === 'HTTP_429'
    ? 'Too many submissions — please wait a moment and try again.'
    : `Your feedback could not be submitted (${code}). Please try again.`;
}

export function BetaFeedbackForm({ pageContext, onSubmitted }: BetaFeedbackFormProps) {
  const formId = useId();
  const screenshotInput = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState('');
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>({ state: 'idle' });

  const context = pageContext ?? (typeof window !== 'undefined' ? window.location.pathname : '/beta/feedback');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status.state === 'submitting') return;

    if (rating === null) {
      setStatus({ state: 'error', message: 'Please select a rating.' });
      return;
    }
    if (category === null) {
      setStatus({ state: 'error', message: 'Please select a category.' });
      return;
    }
    if (!message.trim()) {
      setStatus({ state: 'error', message: 'Please tell us a little more before submitting.' });
      return;
    }

    setStatus({ state: 'submitting' });

    const result = await submitFeedback({
      rating,
      category,
      message: message.trim(),
      pageContext: context,
      browserInfo: getBrowserInfo(),
    });

    if (result.error) {
      setStatus({ state: 'error', message: rateLimitMessage(result.error.code) });
      return;
    }

    setStatus({ state: 'success' });
    setMessage('');
    setScreenshotName(null);
    if (screenshotInput.current) screenshotInput.current.value = '';
    onSubmitted?.(result.data as FeedbackSubmission);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Rating */}
      <fieldset>
        <legend className="block font-mono text-xs text-charcoal/70 mb-2">
          Overall rating <span className="text-clay">*</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3, 4, 5] as FeedbackRating[]).map((value) => (
            <label key={value} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${formId}-rating`}
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                disabled={status.state === 'submitting'}
                className="sr-only peer"
              />
              <span
                className="inline-flex items-center justify-center w-10 h-10 border rounded-md font-mono text-sm
                  border-charcoal/20 text-charcoal/70
                  peer-checked:bg-ink peer-checked:text-bone peer-checked:border-ink
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust/50
                  transition-colors"
                aria-hidden="true"
              >
                {value}
              </span>
              <span className="sr-only">{RATING_LABELS[value]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Category */}
      <div>
        <label htmlFor={`${formId}-category`} className="block font-mono text-xs text-charcoal/70 mb-1">
          Category <span className="text-clay">*</span>
        </label>
        <select
          id={`${formId}-category`}
          value={category ?? ''}
          onChange={(e) => setCategory((e.target.value || null) as FeedbackCategory | null)}
          required
          disabled={status.state === 'submitting'}
          className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-ink
            focus:outline-none focus:border-charcoal/50 focus:ring-1 focus:ring-charcoal/20
            disabled:bg-bone disabled:text-charcoal/40"
        >
          <option value="">Select a category…</option>
          {FEEDBACK_CATEGORIES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor={`${formId}-message`} className="block font-mono text-xs text-charcoal/70 mb-1">
          Your feedback <span className="text-clay">*</span>
        </label>
        <textarea
          id={`${formId}-message`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          disabled={status.state === 'submitting'}
          placeholder="What worked well, what could be better, what did you expect to find?"
          className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-ink
            focus:outline-none focus:border-charcoal/50 focus:ring-1 focus:ring-charcoal/20
            disabled:bg-bone disabled:text-charcoal/40"
        />
      </div>

      {/* Screenshot — wired to the UI but not uploaded during the beta */}
      <div>
        <label htmlFor={`${formId}-screenshot`} className="block font-mono text-xs text-charcoal/70 mb-1">
          Screenshot (optional)
        </label>
        <input
          id={`${formId}-screenshot`}
          ref={screenshotInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setScreenshotName(e.target.files?.[0]?.name ?? null)}
          disabled={status.state === 'submitting'}
          className="block w-full text-sm text-charcoal/70
            file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0
            file:bg-charcoal file:text-white file:font-mono file:text-xs file:cursor-pointer
            hover:file:bg-charcoal/90"
        />
        <p className="font-mono text-[10px] text-charcoal/40 mt-1">
          {screenshotName
            ? `Selected: ${screenshotName}. Attachments are not uploaded during the beta — please describe the issue in text.`
            : 'Attachments are not uploaded during the beta; the field is shown so you know what will be available at launch.'}
        </p>
      </div>

      {/* Status feedback */}
      {status.state === 'error' && (
        <div role="alert" className="bg-clay/5 border border-clay/20 rounded-md p-3">
          <p className="font-mono text-xs text-clay">{status.message}</p>
        </div>
      )}
      {status.state === 'success' && (
        <div role="status" className="bg-trust/5 border border-trust/20 rounded-md p-3">
          <p className="font-mono text-xs text-trust">
            Thank you — your feedback has been received.
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={status.state === 'submitting'}
          className="px-6 py-2 bg-charcoal text-white font-mono text-sm rounded
            hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-charcoal/40
            disabled:bg-charcoal/30 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          {status.state === 'submitting' ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </div>
    </form>
  );
}
