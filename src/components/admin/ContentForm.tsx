// src/components/admin/ContentForm.tsx
// Shared content form with field validation — used by ContentEditor.
// Renders form fields based on content type configuration.

import { type ReactNode } from 'react';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'url' | 'richtext';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  hint?: string;
  rows?: number;
}

export interface ContentFormProps {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  header?: ReactNode;
}

export function ContentForm({
  fields,
  values,
  onChange,
  errors = {},
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Save',
  header,
}: ContentFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  function renderField(field: FormField) {
    const value = values[field.key] ?? '';
    const error = errors[field.key];

    const baseInputClass = `w-full px-3 py-2 border rounded font-mono text-sm text-ink
      focus:outline-none focus:ring-1 focus:ring-charcoal/20
      disabled:bg-bone disabled:text-charcoal/40
      ${error ? 'border-clay/50 focus:border-clay' : 'border-charcoal/20 focus:border-charcoal/50'}`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={`field-${field.key}`}
            value={String(value)}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows ?? 4}
            disabled={isSubmitting}
            className={baseInputClass}
          />
        );
      case 'select':
        return (
          <select
            id={`field-${field.key}`}
            value={String(value)}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={field.required}
            disabled={isSubmitting}
            className={baseInputClass}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            id={`field-${field.key}`}
            type="number"
            value={value === null || value === undefined ? '' : String(value)}
            onChange={(e) => onChange(field.key, e.target.value ? Number(e.target.value) : null)}
            required={field.required}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            className={baseInputClass}
          />
        );
      case 'date':
        return (
          <input
            id={`field-${field.key}`}
            type="date"
            value={String(value)}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={field.required}
            disabled={isSubmitting}
            className={baseInputClass}
          />
        );
      case 'url':
        return (
          <input
            id={`field-${field.key}`}
            type="url"
            value={String(value)}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder ?? 'https://'}
            disabled={isSubmitting}
            className={baseInputClass}
          />
        );
      default:
        return (
          <input
            id={`field-${field.key}`}
            type="text"
            value={String(value)}
            onChange={(e) => onChange(field.key, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            className={baseInputClass}
          />
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {header}

      <div className="space-y-4">
        {fields.map((field) => {
          const fieldError = errors[field.key];
          return (
          <div key={field.key}>
            <label
              htmlFor={`field-${field.key}`}
              className="block font-mono text-xs text-charcoal/70 mb-1"
            >
              {field.label}
              {field.required && <span className="text-clay ml-0.5">*</span>}
            </label>
            {renderField(field)}
            {field.hint && !fieldError && (
              <p className="font-mono text-[10px] text-charcoal/40 mt-0.5">{field.hint}</p>
            )}
            {fieldError && (
              <p className="font-mono text-[10px] text-clay mt-0.5" role="alert">{fieldError}</p>
            )}
          </div>
        )})}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-charcoal text-white font-mono text-sm rounded
            hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-charcoal/40
            disabled:bg-charcoal/30 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── Pre-built field sets for each content type ────────────────────────────────

export const EVIDENCE_FIELDS: FormField[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true, hint: 'URL-friendly identifier' },
  { key: 'summary', label: 'Summary', type: 'textarea', required: true, rows: 3 },
  { key: 'body', label: 'Body', type: 'textarea', rows: 8 },
  { key: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'legal-record', label: 'Legal Record' },
    { value: 'humanitarian-access', label: 'Humanitarian Access' },
    { value: 'attack', label: 'Attack' },
    { value: 'displacement', label: 'Displacement' },
    { value: 'other', label: 'Other' },
  ]},
  { key: 'country_or_territory', label: 'Country / Territory', type: 'text' },
  { key: 'location_name', label: 'Location Name', type: 'text' },
  { key: 'incident_date', label: 'Incident Date', type: 'date' },
  { key: 'verification_level', label: 'Verification Level', type: 'number', hint: '0-5 scale' },
];

export const SOURCE_FIELDS: FormField[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'select', required: true, options: [
    { value: 'court', label: 'Court' },
    { value: 'un_body', label: 'UN Body' },
    { value: 'ngo', label: 'NGO' },
    { value: 'media', label: 'Media' },
    { value: 'government', label: 'Government' },
    { value: 'eu_body', label: 'EU Body' },
    { value: 'academic', label: 'Academic' },
  ]},
  { key: 'url', label: 'URL', type: 'url' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'credibility_tier', label: 'Credibility Tier', type: 'number', hint: '1-5 scale' },
  { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 },
];

export const ORGANIZATION_FIELDS: FormField[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'select', options: [
    { value: 'UN body', label: 'UN Body' },
    { value: 'ngo', label: 'NGO' },
    { value: 'international-organization', label: 'International Organization' },
    { value: 'government', label: 'Government' },
  ]},
  { key: 'website', label: 'Website', type: 'url' },
  { key: 'notes', label: 'Notes', type: 'textarea', rows: 3 },
];

export const LEGAL_CASE_FIELDS: FormField[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'institution', label: 'Institution', type: 'text', required: true },
  { key: 'jurisdiction', label: 'Jurisdiction', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'Proceedings ongoing', label: 'Proceedings Ongoing' },
    { value: 'Judgment delivered', label: 'Judgment Delivered' },
    { value: 'Investigation ongoing', label: 'Investigation Ongoing' },
    { value: 'Arrest warrants issued', label: 'Arrest Warrants Issued' },
    { value: 'Closed', label: 'Closed' },
  ]},
  { key: 'summary', label: 'Summary', type: 'textarea', rows: 4 },
  { key: 'opened_date', label: 'Opened Date', type: 'date' },
  { key: 'source_url', label: 'Source URL', type: 'url' },
];
