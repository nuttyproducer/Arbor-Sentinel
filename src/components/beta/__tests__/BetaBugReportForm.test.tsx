// src/components/beta/__tests__/BetaBugReportForm.test.tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BetaBugReportForm } from '../BetaBugReportForm';
import { submitBugReport } from '../../../lib/beta/feedback';
import type { BugReport } from '../../../lib/beta/types';

vi.mock('../../../lib/beta/feedback', () => ({
  getBrowserInfo: () => 'ua | lang=en | platform=test | screen=800x600',
  submitFeedback: vi.fn(),
  submitBugReport: vi.fn(),
  trackUserJourney: vi.fn(),
  isJourneyTrackingEnabled: vi.fn(() => false),
  setJourneyTrackingEnabled: vi.fn(),
}));

const submitBugReportMock = vi.mocked(submitBugReport);

const REPORT: BugReport = {
  id: 'br-1',
  userId: 'user-1',
  title: 'Search breaks on empty query',
  description: 'Search throws when the query is empty',
  stepsToReproduce: '1. Open /search',
  expectedBehavior: 'Show all records',
  actualBehavior: 'Blank page',
  browserInfo: 'ua',
  severity: 'major',
  status: 'new',
  timestamp: '2026-08-04T00:00:00Z',
};

function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/Title/), { target: { value: 'Search breaks on empty query' } });
  fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'Search throws when the query is empty' } });
  fireEvent.change(screen.getByLabelText(/Steps to reproduce/), { target: { value: '1. Open /search' } });
  fireEvent.change(screen.getByLabelText(/Expected behavior/), { target: { value: 'Show all records' } });
  fireEvent.change(screen.getByLabelText(/Actual behavior/), { target: { value: 'Blank page' } });
  fireEvent.change(screen.getByLabelText(/Severity/), { target: { value: 'major' } });
}

describe('BetaBugReportForm', () => {
  beforeEach(() => {
    submitBugReportMock.mockReset();
  });

  it('renders all required fields', () => {
    render(<BetaBugReportForm />);
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Steps to reproduce/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected behavior/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Actual behavior/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Severity/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Screenshot/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Bug Report' })).toBeInTheDocument();
  });

  it('shows a validation error when required fields are missing', () => {
    render(<BetaBugReportForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit Bug Report' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please provide a short title.');
    expect(submitBugReportMock).not.toHaveBeenCalled();
  });

  it('submits a bug report with all fields and browser info', async () => {
    submitBugReportMock.mockResolvedValue({ data: REPORT, meta: null, error: null });

    render(<BetaBugReportForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Bug Report' }));

    await waitFor(() => expect(submitBugReportMock).toHaveBeenCalledTimes(1));
    expect(submitBugReportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Search breaks on empty query',
        description: 'Search throws when the query is empty',
        stepsToReproduce: '1. Open /search',
        expectedBehavior: 'Show all records',
        actualBehavior: 'Blank page',
        severity: 'major',
        browserInfo: 'ua | lang=en | platform=test | screen=800x600',
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('has been received');
  });

  it('surfaces a rate-limit error with HTTP_429', async () => {
    submitBugReportMock.mockResolvedValue({
      data: null,
      meta: null,
      error: { code: 'HTTP_429', message: 'Request failed: Too Many Requests' },
    });

    render(<BetaBugReportForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Bug Report' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many submissions');
  });

  it('calls onSubmitted after a successful submission', async () => {
    const onSubmitted = vi.fn();
    submitBugReportMock.mockResolvedValue({ data: REPORT, meta: null, error: null });

    render(<BetaBugReportForm onSubmitted={onSubmitted} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Bug Report' }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(REPORT));
  });
});
