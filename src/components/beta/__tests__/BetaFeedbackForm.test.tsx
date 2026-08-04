// src/components/beta/__tests__/BetaFeedbackForm.test.tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BetaFeedbackForm } from '../BetaFeedbackForm';
import { submitFeedback } from '../../../lib/beta/feedback';
import type { FeedbackSubmission } from '../../../lib/beta/types';

vi.mock('../../../lib/beta/feedback', () => ({
  getBrowserInfo: () => 'ua | lang=en | platform=test | screen=800x600',
  submitFeedback: vi.fn(),
  submitBugReport: vi.fn(),
  trackUserJourney: vi.fn(),
  isJourneyTrackingEnabled: vi.fn(() => false),
  setJourneyTrackingEnabled: vi.fn(),
}));

const submitFeedbackMock = vi.mocked(submitFeedback);

const SUBMISSION: FeedbackSubmission = {
  id: 'fb-1',
  userId: 'user-1',
  rating: 4,
  category: 'content',
  message: 'Great content',
  pageContext: '/beta/feedback',
  browserInfo: 'ua',
  timestamp: '2026-08-04T00:00:00Z',
  status: 'new',
};

function fillValidForm() {
  fireEvent.click(screen.getByRole('radio', { name: 'Good' }));
  fireEvent.change(screen.getByLabelText(/Category/), { target: { value: 'content' } });
  fireEvent.change(screen.getByLabelText(/Your feedback/), { target: { value: 'Great content' } });
}

describe('BetaFeedbackForm', () => {
  beforeEach(() => {
    submitFeedbackMock.mockReset();
  });

  it('renders rating, category, message, and screenshot fields', () => {
    render(<BetaFeedbackForm pageContext="/beta/feedback" />);
    expect(screen.getByRole('radio', { name: 'Excellent' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Very poor' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your feedback/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Screenshot/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeInTheDocument();
  });

  it('shows a validation error when required fields are missing', () => {
    render(<BetaFeedbackForm pageContext="/beta/feedback" />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a rating.');
    expect(submitFeedbackMock).not.toHaveBeenCalled();
  });

  it('submits feedback with rating, category, message, and browser info', async () => {
    submitFeedbackMock.mockResolvedValue({ data: SUBMISSION, meta: null, error: null });

    render(<BetaFeedbackForm pageContext="/beta/feedback" />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

    await waitFor(() => expect(submitFeedbackMock).toHaveBeenCalledTimes(1));
    expect(submitFeedbackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: 4,
        category: 'content',
        message: 'Great content',
        pageContext: '/beta/feedback',
        browserInfo: 'ua | lang=en | platform=test | screen=800x600',
      }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent('has been received');
  });

  it('surfaces a rate-limit error with HTTP_429', async () => {
    submitFeedbackMock.mockResolvedValue({
      data: null,
      meta: null,
      error: { code: 'HTTP_429', message: 'Request failed: Too Many Requests' },
    });

    render(<BetaFeedbackForm pageContext="/beta/feedback" />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many submissions');
  });

  it('calls onSubmitted after a successful submission', async () => {
    const onSubmitted = vi.fn();
    submitFeedbackMock.mockResolvedValue({ data: SUBMISSION, meta: null, error: null });

    render(<BetaFeedbackForm pageContext="/beta/feedback" onSubmitted={onSubmitted} />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Submit Feedback' }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(SUBMISSION));
  });
});
