// src/lib/beta/feedback.ts
// Beta feedback & bug report API integration.
//
// Follows the src/lib/api/client.ts pattern: typed fetch helpers returning a
// consistent ApiResponse<T> envelope. Rate limiting is enforced server-side
// (M7-03) and surfaces as HTTP_429 in the error response.

import type { ApiResponse } from '../api/types';
import type {
  BugReport,
  BugReportInput,
  FeedbackSubmission,
  FeedbackSubmissionInput,
  UserJourney,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

// ── Fetch helpers (mirror of src/lib/api/client.ts) ───────────────────────────

async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return {
      data: null,
      meta: null,
      error: {
        code: `HTTP_${response.status}`,
        message: `Request failed: ${response.statusText}`,
      },
    };
  }

  return response.json();
}

// ── Browser info ──────────────────────────────────────────────────────────────
// Captured at submission time so maintainers can reproduce issues.
// Does not collect personal data beyond what the browser already exposes.

export function getBrowserInfo(): string {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  const lang = nav?.language ?? nav?.languages?.[0] ?? 'unknown';
  const platform = (nav as unknown as { platform?: string })?.platform ?? 'unknown';
  const screen = typeof window !== 'undefined' && window.screen
    ? `${window.screen.width}x${window.screen.height}`
    : 'unknown';

  return [nav?.userAgent ?? 'unknown', `lang=${lang}`, `platform=${platform}`, `screen=${screen}`].join(' | ');
}

// ── Feedback submissions ──────────────────────────────────────────────────────

export async function submitFeedback(
  input: FeedbackSubmissionInput,
): Promise<ApiResponse<FeedbackSubmission>> {
  return apiPost<FeedbackSubmission>('/feedback', input);
}

// ── Bug reports ───────────────────────────────────────────────────────────────

export async function submitBugReport(
  input: BugReportInput,
): Promise<ApiResponse<BugReport>> {
  return apiPost<BugReport>('/bug-reports', input);
}

// ── User journey tracking (opt-in, aggregate only) ────────────────────────────
// Anonymous aggregate analytics — which pages were visited and which features
// were used. Never includes user identifiers. Opt-in via the "beta analytics"
// preference stored in localStorage.

const JOURNEY_OPT_IN_KEY = 'beta:analytics-opt-in';

export function isJourneyTrackingEnabled(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(JOURNEY_OPT_IN_KEY) === '1';
}

export function setJourneyTrackingEnabled(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (enabled) {
    localStorage.setItem(JOURNEY_OPT_IN_KEY, '1');
  } else {
    localStorage.removeItem(JOURNEY_OPT_IN_KEY);
  }
}

export async function trackUserJourney(journey: UserJourney): Promise<void> {
  if (!isJourneyTrackingEnabled()) return;

  const url = new URL(`${API_BASE}/beta/user-journeys`, window.location.origin);
  try {
    await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(journey),
      // Best-effort — never block the user experience on analytics.
      keepalive: true,
    });
  } catch {
    // Silently ignore — journey analytics are non-critical.
  }
}
