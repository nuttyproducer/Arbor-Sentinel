// src/components/admin/FeedForm.tsx
// Add/edit form for RSS/Atom feed definitions.

import { useState, useEffect } from "react";

export interface FeedFormData {
  name: string;
  url: string;
  source_type: string;
  category: string;
  parser: string;
  language: string;
  poll_interval_minutes: number;
  trust_level: number;
  enabled: boolean;
}

interface FeedFormProps {
  initial?: Partial<FeedFormData>;
  onSubmit: (data: FeedFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const SOURCE_TYPES = [
  { value: "journalism", label: "Journalism" },
  { value: "ngo", label: "NGO" },
  { value: "academic", label: "Academic" },
  { value: "un", label: "UN Body" },
  { value: "government", label: "Government" },
  { value: "humanitarian", label: "Humanitarian" },
  { value: "court", label: "Court / Legal" },
  { value: "osint", label: "OSINT" },
];

const PARSER_TYPES = [
  { value: "rss", label: "RSS 2.0" },
  { value: "atom", label: "Atom 1.0" },
  { value: "jsonfeed", label: "JSON Feed" },
  { value: "html", label: "HTML Scraping" },
  { value: "api", label: "REST API" },
];

const DEFAULTS: FeedFormData = {
  name: "",
  url: "",
  source_type: "journalism",
  category: "",
  parser: "rss",
  language: "en",
  poll_interval_minutes: 60,
  trust_level: 3,
  enabled: true,
};

export function FeedForm({ initial, onSubmit, onCancel, loading }: FeedFormProps) {
  const [data, setData] = useState<FeedFormData>({ ...DEFAULTS, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof FeedFormData, string>>>({});

  useEffect(() => {
    if (initial) {
      setData({ ...DEFAULTS, ...initial });
    }
  }, [initial]);

  function validate(): boolean {
    const errs: Partial<Record<keyof FeedFormData, string>> = {};
    if (!data.name.trim()) errs.name = "Name is required";
    if (!data.url.trim()) errs.url = "URL is required";
    else {
      try {
        new URL(data.url);
      } catch {
        errs.url = "Invalid URL";
      }
    }
    if (data.poll_interval_minutes < 5) errs.poll_interval_minutes = "Minimum 5 minutes";
    if (data.poll_interval_minutes > 1440) errs.poll_interval_minutes = "Maximum 1440 minutes";
    if (data.trust_level < 0 || data.trust_level > 5) errs.trust_level = "Must be 0–5";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-charcoal/10 rounded-lg p-6">
      <h3 className="font-serif text-lg font-semibold text-ink mb-6">
        {initial?.name ? `Edit: ${initial.name}` : "Add Feed"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-mono text-charcoal/60 mb-1">Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40"
            placeholder="e.g. Reuters World News"
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* URL */}
        <div className="md:col-span-2">
          <label className="block text-xs font-mono text-charcoal/60 mb-1">Feed URL</label>
          <input
            type="url"
            value={data.url}
            onChange={(e) => setData({ ...data, url: e.target.value })}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40"
            placeholder="https://example.com/rss"
          />
          {errors.url && <p className="text-xs text-red-600 mt-1">{errors.url}</p>}
        </div>

        {/* Source Type */}
        <div>
          <label className="block text-xs font-mono text-charcoal/60 mb-1">Source Type</label>
          <select
            value={data.source_type}
            onChange={(e) => setData({ ...data, source_type: e.target.value })}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40 bg-white"
          >
            {SOURCE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Parser */}
        <div>
          <label className="block text-xs font-mono text-charcoal/60 mb-1">Parser</label>
          <select
            value={data.parser}
            onChange={(e) => setData({ ...data, parser: e.target.value })}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40 bg-white"
          >
            {PARSER_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-mono text-charcoal/60 mb-1">Category</label>
          <input
            type="text"
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40"
            placeholder="e.g. news, human_rights"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-xs font-mono text-charcoal/60 mb-1">Language</label>
          <input
            type="text"
            value={data.language}
            onChange={(e) => setData({ ...data, language: e.target.value })}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40"
            placeholder="en, fr, ar, ..."
            maxLength={5}
          />
        </div>

        {/* Poll Interval */}
        <div>
          <label className="block text-xs font-mono text-charcoal/60 mb-1">
            Poll Interval (minutes)
          </label>
          <input
            type="number"
            value={data.poll_interval_minutes}
            onChange={(e) =>
              setData({ ...data, poll_interval_minutes: parseInt(e.target.value, 10) || 0 })
            }
            min={5}
            max={1440}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40"
          />
          {errors.poll_interval_minutes && (
            <p className="text-xs text-red-600 mt-1">{errors.poll_interval_minutes}</p>
          )}
        </div>

        {/* Trust Level */}
        <div>
          <label className="block text-xs font-mono text-charcoal/60 mb-1">
            Trust Level (0–5)
          </label>
          <input
            type="number"
            value={data.trust_level}
            onChange={(e) =>
              setData({ ...data, trust_level: parseInt(e.target.value, 10) || 0 })
            }
            min={0}
            max={5}
            className="w-full px-3 py-2 border border-charcoal/20 rounded font-mono text-sm focus:outline-none focus:border-charcoal/40"
          />
        </div>

        {/* Enabled Toggle */}
        <div className="flex items-center gap-3 pt-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(e) => setData({ ...data, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-charcoal/20 peer-checked:bg-emerald-500 rounded-full peer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[16px]" />
          </label>
          <span className="text-sm font-mono text-charcoal/60">
            {data.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4 border-t border-charcoal/10">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-ink text-white font-mono text-sm rounded hover:bg-charcoal/80 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving…" : initial?.name ? "Update Feed" : "Add Feed"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-charcoal/20 rounded font-mono text-sm text-charcoal/60 hover:bg-charcoal/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
