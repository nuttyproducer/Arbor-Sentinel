// src/lib/beta/__tests__/feedback.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getBrowserInfo,
  isJourneyTrackingEnabled,
  setJourneyTrackingEnabled,
  submitBugReport,
  submitFeedback,
  trackUserJourney,
} from '../feedback';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  } as Response;
}

describe('getBrowserInfo', () => {
  it('returns a pipe-delimited string with browser context', () => {
    const info = getBrowserInfo();
    expect(typeof info).toBe('string');
    expect(info).toContain('lang=');
    expect(info).toContain('platform=');
    expect(info).toContain('screen=');
  });
});

describe('submitFeedback', () => {
  const input = {
    rating: 4 as const,
    category: 'content' as const,
    message: 'Great content, keep it up',
    pageContext: '/beta/feedback',
    browserInfo: 'ua | lang=en | platform= | screen=800x600',
  };

  it('POSTs to /feedback and returns the submission', async () => {
    const submission = {
      id: 'fb-1',
      userId: 'user-1',
      ...input,
      timestamp: '2026-08-04T00:00:00Z',
      status: 'new',
    };
    fetchMock.mockResolvedValue(jsonResponse({ data: submission, meta: null, error: null }));

    const result = await submitFeedback(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/feedback$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(input);
    expect(result.data).toEqual(submission);
    expect(result.error).toBeNull();
  });

  it('returns HTTP_429 error when rate limited', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false, 429));

    const result = await submitFeedback(input);

    expect(result.data).toBeNull();
    expect(result.error?.code).toBe('HTTP_429');
  });

  it('returns a generic HTTP error on failure', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false, 500));

    const result = await submitFeedback(input);

    expect(result.error?.code).toBe('HTTP_500');
  });
});

describe('submitBugReport', () => {
  const input = {
    title: 'Search breaks on empty query',
    description: 'Search throws when the query is empty',
    stepsToReproduce: '1. Open /search\n2. Press enter',
    expectedBehavior: 'Show all records',
    actualBehavior: 'Blank page',
    browserInfo: 'ua',
    severity: 'major' as const,
  };

  it('POSTs to /bug-reports and returns the report', async () => {
    const report = {
      id: 'br-1',
      userId: 'user-1',
      ...input,
      status: 'new',
      timestamp: '2026-08-04T00:00:00Z',
    };
    fetchMock.mockResolvedValue(jsonResponse({ data: report, meta: null, error: null }));

    const result = await submitBugReport(input);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/bug-reports$/);
    expect(init.method).toBe('POST');
    expect(result.data).toEqual(report);
  });

  it('returns HTTP_429 error when rate limited', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false, 429));
    const result = await submitBugReport(input);
    expect(result.error?.code).toBe('HTTP_429');
  });
});

describe('user journey tracking', () => {
  const journey = { page: '/map', feature: 'map:filter', timeOnPage: 12.4 };

  it('is disabled by default', () => {
    expect(isJourneyTrackingEnabled()).toBe(false);
  });

  it('respects the opt-in preference', () => {
    setJourneyTrackingEnabled(true);
    expect(isJourneyTrackingEnabled()).toBe(true);
    setJourneyTrackingEnabled(false);
    expect(isJourneyTrackingEnabled()).toBe(false);
  });

  it('does not POST when not opted in', async () => {
    await trackUserJourney(journey);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('POSTs to /beta/user-journeys when opted in', async () => {
    setJourneyTrackingEnabled(true);
    fetchMock.mockResolvedValue(jsonResponse({ data: null, meta: null, error: null }));
    await trackUserJourney(journey);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/beta\/user-journeys$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(journey);
  });

  it('never throws when the request fails', async () => {
    setJourneyTrackingEnabled(true);
    fetchMock.mockRejectedValue(new Error('network down'));
    await expect(trackUserJourney(journey)).resolves.toBeUndefined();
  });
});
