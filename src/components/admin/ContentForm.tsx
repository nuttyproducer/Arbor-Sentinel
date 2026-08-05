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
