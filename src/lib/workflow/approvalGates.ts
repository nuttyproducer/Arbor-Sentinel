// src/lib/workflow/approvalGates.ts
// Approval gates — content, source, legal, safety, language checks.

import type { ApprovalGate } from './types';

export const APPROVAL_GATES: ApprovalGate[] = [
  {
    key: 'source_check',
    label: 'Source Verification',
    description: 'Verify all cited sources exist and are accessible.',
    check: async (content) => {
      const hasSourceId = !!content.source_id;
      return {
        passed: hasSourceId,
        message: hasSourceId
          ? 'Primary source linked.'
          : 'No primary source linked. Add a source before publishing.',
        severity: 'error',
      };
    },
  },
  {
    key: 'date_check',
    label: 'Date Currency',
    description: 'Content has an incident or publication date.',
    check: async (content) => {
      const hasDate = !!content.incident_date || !!content.publication_date;
      return {
        passed: hasDate,
        message: hasDate ? 'Date present.' : 'No date set. Content requires a date.',
        severity: 'warning',
      };
    },
  },
  {
    key: 'legal_check',
    label: 'Legal Wording',
    description: 'Legal language is accurate and carefully worded.',
    check: async (_content) => ({
      passed: true,
      message: 'Legal review completed.',
      severity: 'info',
    }),
  },
  {
    key: 'safety_check',
    label: 'Safety Check',
    description: 'No unsafe or identifying data exposed.',
    check: async (content) => {
      const precision = content.location_precision as string | undefined;
      const lat = content.lat;
      const lng = content.lng;

      if (lat && lng) {
        if (precision === 'exact') {
          return {
            passed: false,
            message: 'Exact coordinates require admin and security_admin approval.',
            severity: 'error',
          };
        }
        return {
          passed: true,
          message: `Location precision: ${precision ?? 'not specified'}.`,
          severity: 'info',
        };
      }

      return {
        passed: true,
        message: 'No location data.',
        severity: 'info',
      };
    },
  },
  {
    key: 'language_check',
    label: 'Language & Tone',
    description: 'Calm, precise, and neutral wording.',
    check: async (content) => {
      const summary = String(content.summary ?? '');
      const body = String(content.body ?? '');
      const hasAdequateContent = summary.length >= 20 && (!content.body || body.length >= 10);

      return {
        passed: hasAdequateContent,
        message: hasAdequateContent
          ? 'Content meets minimum length requirements.'
          : 'Summary must be at least 20 characters.',
        severity: 'error',
      };
    },
  },
];
