// src/components/beta/BetaBugReportForm.tsx
// Beta bug report form — description, reproduction steps, expected vs actual
// behavior, browser/device info, severity, optional screenshot.
//
// Authentication is enforced by the route guard. Browser info is captured
// automatically at submission time. The screenshot picker is wired into the UI
// but files are not uploaded during the beta.

import { useId, useRef, useState, type FormEvent } from 'react';
import { getBrowserInfo, submitBugReport } from '../../lib/beta/feedback';
import { BUG_SEVERITIES, type BugReport, type BugSeverity } from '../../lib/beta/types';

interface BetaBugReportFormProps {
  /** Called after a successful submission. */
  onSubmitted?: (report: BugReport) => void;
}

type FormStatus =
  | { state: 'idle' }
  | { state: 'submitting' }
  | { state: 'success' }
  | { state: 'error'; message: string };

function rateLimitMessage(code: string): string {
  return code === 'HTTP_429'
    ? 'Too many submissions — please wait a moment and try again.'
    : `Your bug report could not be submitted (${code}). Please try again.`;
}

const baseInputClass = `w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm text-ink
  focus:outline-none focus:border-charcoal/50 focus:ring-1 focus:ring-charcoal/20
  disabled:bg-bone disabled:text-charcoal/40`;

const labelClass = 'block font-mono text-xs text-charcoal/70 mb-1';

export function BetaBugReportForm({ onSubmitted }: BetaBugReportFormProps) {
  const formId = useId();
  const screenshotInput = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [severity, setSeverity] = useState<BugSeverity | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>({ state: 'idle' });

  function resetForm() {
    setTitle('');
    setDescription('');
    setStepsToReproduce('');
    setExpectedBehavior('');
    setActualBehavior('');
    setSeverity(null);
    setScreenshotName(null);
    if (screenshotInput.current) screenshotInput.current.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status.state === 'submitting') return;

    if (!title.trim()) {
      setStatus({ state: 'error', message: 'Please provide a short title.' });
      return;
    }
    if (!description.trim()) {
      setStatus({ state: 'error', message: 'Please describe the bug.' });
      return;
    }
    if (!stepsToReproduce.trim()) {
      setStatus({ state: 'error', message: 'Please list the steps to reproduce.' });
      return;
    }
    if (!expectedBehavior.trim() || !actualBehavior.trim()) {
      setStatus({ state: 'error', message: 'Please describe the expected and actual behavior.' });
      return;
    }
    if (severity === null) {
      setStatus({ state: 'error', message: 'Please select a severity.' });
      return;
    }

    setStatus({ state: 'submitting' });

    const result = await submitBugReport({
      title: title.trim(),
      description: description.trim(),
      stepsToReproduce: stepsToReproduce.trim(),
      expectedBehavior: expectedBehavior.trim(),
      actualBehavior: actualBehavior.trim(),
      browserInfo: getBrowserInfo(),
      severity,
    });

    if (result.error) {
      setStatus({ state: 'error', message: rateLimitMessage(result.error.code) });
      return;
    }

    setStatus({ state: 'success' });
    resetForm();
    onSubmitted?.(result.data as BugReport);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor={`${formId}-title`} className={labelClass}>
          Title <span className="text-clay">*</span>
        </label>
        <input
          id={`${formId}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={status.state === 'submitting'}
          placeholder="One-line summary of the issue"
          className={baseInputClass}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-description`} className={labelClass}>
          Description <span className="text-clay">*</span>
        </label>
        <textarea
          id={`${formId}-description`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          disabled={status.state === 'submitting'}
          placeholder="What is the bug? What did you observe?"
          className={baseInputClass}
        />
      </div>

      <div>
        <label htmlFor={`${formId}-steps`} className={labelClass}>
          Steps to reproduce <span className="text-clay">*</span>
        </label>
        <textarea
          id={`${formId}-steps`}
          value={stepsToReproduce}
          onChange={(e) => setStepsToReproduce(e.target.value)}
          required
          rows={4}
          disabled={status.state === 'submitting'}
          placeholder={'1. Go to…\n2. Click…\n3. Observe…'}
          className={baseInputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor={`${formId}-expected`} className={labelClass}>
            Expected behavior <span className="text-clay">*</span>
          </label>
          <textarea
            id={`${formId}-expected`}
            value={expectedBehavior}
            onChange={(e) => setExpectedBehavior(e.target.value)}
            required
            rows={3}
            disabled={status.state === 'submitting'}
            className={baseInputClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-actual`} className={labelClass}>
            Actual behavior <span className="text-clay">*</span>
          </label>
          <textarea
            id={`${formId}-actual`}
            value={actualBehavior}
            onChange={(e) => setActualBehavior(e.target.value)}
            required
            rows={3}
            disabled={status.state === 'submitting'}
            className={baseInputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${formId}-severity`} className={labelClass}>
          Severity <span className="text-clay">*</span>
        </label>
        <select
          id={`${formId}-severity`}
          value={severity ?? ''}
          onChange={(e) => setSeverity((e.target.value || null) as BugSeverity | null)}
          required
          disabled={status.state === 'submitting'}
          className={baseInputClass}
        >
          <option value="">Select severity…</option>
          {BUG_SEVERITIES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Screenshot — wired to the UI but not uploaded during the beta */}
      <div>
        <label htmlFor={`${formId}-screenshot`} className={labelClass}>
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
            ? `Selected: ${screenshotName}. Attachments are not uploaded during the beta — please include details in text.`
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
            Thank you — your bug report has been received.
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
          {status.state === 'submitting' ? 'Submitting…' : 'Submit Bug Report'}
        </button>
      </div>
    </form>
  );
}
