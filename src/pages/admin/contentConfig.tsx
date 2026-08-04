// src/pages/admin/contentConfig.tsx
// Content-type configuration for the admin CMS list and editor routes.
// Each content type maps to a table name, list columns, and editor fields.

import type { FormField } from "../../components/admin/ContentForm";
import type { Column } from "../../components/admin/ContentTable";
import {
  EVIDENCE_COLUMNS,
  SOURCE_COLUMNS,
  ORGANIZATION_COLUMNS,
  LEGAL_CASE_COLUMNS,
} from "./ContentList";

// ── Column sets (shared) ─────────────────────────────────────────────────────

export const COUNTRY_COLUMNS = [
  { key: "name", header: "Name", sortable: true, render: (r: Record<string, unknown>) => (
    <span className="text-ink font-medium">{String(r.name)}</span>
  )},
  { key: "region", header: "Region", sortable: true, render: (r: Record<string, unknown>) => String(r.region ?? "—") },
  { key: "eu_member", header: "EU", sortable: true, render: (r: Record<string, unknown>) => (r.eu_member ? "Yes" : "No") },
];

export const ACTION_COLUMNS = [
  { key: "title", header: "Title", sortable: true, render: (r: Record<string, unknown>) => (
    <span className="text-ink font-medium">{String(r.title)}</span>
  )},
  { key: "action_type", header: "Type", sortable: true, render: (r: Record<string, unknown>) => String(r.action_type ?? "—") },
  { key: "language", header: "Language", sortable: true, render: (r: Record<string, unknown>) => String(r.language ?? "—") },
];

export const DOSSIER_COLUMNS = [
  { key: "title", header: "Title", sortable: true, render: (r: Record<string, unknown>) => (
    <span className="text-ink font-medium">{String(r.title)}</span>
  )},
  { key: "dossier_type", header: "Type", sortable: true, render: (r: Record<string, unknown>) => String(r.dossier_type ?? "—") },
  { key: "published", header: "Published", sortable: true, render: (r: Record<string, unknown>) => (r.published ? "Yes" : "No") },
];

// ── Editor field sets ─────────────────────────────────────────────────────────

export const EVIDENCE_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "slug", label: "Slug", type: "text", required: true, hint: "URL-safe identifier, e.g. icj-provisional-measures-jan-2024" },
  { key: "summary", label: "Summary", type: "textarea", required: true, rows: 3 },
  { key: "body", label: "Body", type: "richtext", rows: 8 },
  { key: "category", label: "Category", type: "text", required: true },
  { key: "country_or_territory", label: "Country / Territory", type: "text" },
  { key: "location_precision", label: "Location Precision", type: "select", options: [
    { value: "country", label: "Country" },
    { value: "region", label: "Region" },
    { value: "city", label: "City" },
    { value: "district", label: "District" },
    { value: "exact", label: "Exact (requires admin approval)" },
  ]},
  { key: "verification_level", label: "Verification Level", type: "number" },
  { key: "incident_date", label: "Incident Date", type: "date" },
  { key: "publication_date", label: "Publication Date", type: "date" },
];

export const SOURCE_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "type", label: "Type", type: "select", options: [
    { value: "court", label: "Court / legal record" },
    { value: "un", label: "UN / international body" },
    { value: "government", label: "Government / parliamentary record" },
    { value: "humanitarian", label: "Humanitarian organization" },
    { value: "ngo", label: "Human-rights organization" },
    { value: "academic", label: "Academic research" },
    { value: "journalism", label: "Investigative journalism" },
    { value: "osint", label: "OSINT / documentation group" },
  ], required: true },
  { key: "url", label: "URL", type: "url", required: true },
  { key: "country", label: "Country", type: "text" },
  { key: "credibility_tier", label: "Credibility Tier", type: "number" },
  { key: "notes", label: "Notes", type: "textarea", rows: 3 },
];

export const COUNTRY_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "iso_code", label: "ISO Code", type: "text" },
  { key: "region", label: "Region", type: "text" },
  { key: "eu_member", label: "EU Member", type: "select", options: [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]},
  { key: "nato_member", label: "NATO Member", type: "select", options: [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ]},
];

export const ORGANIZATION_FIELDS: FormField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "type", label: "Type", type: "text" },
  { key: "website", label: "Website", type: "url" },
  { key: "regions", label: "Regions", type: "text", hint: "Comma-separated" },
  { key: "services", label: "Services", type: "text", hint: "Comma-separated" },
  { key: "partnership_status", label: "Partnership Status", type: "text" },
];

export const LEGAL_CASE_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "institution", label: "Institution", type: "text" },
  { key: "jurisdiction", label: "Jurisdiction", type: "text" },
  { key: "status", label: "Status", type: "text" },
  { key: "summary", label: "Summary", type: "textarea", rows: 4 },
  { key: "opened_date", label: "Opened Date", type: "date" },
  { key: "latest_update_date", label: "Latest Update Date", type: "date" },
];

export const ACTION_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "action_type", label: "Action Type", type: "text" },
  { key: "issue", label: "Issue", type: "text" },
  { key: "template_body", label: "Template Body", type: "textarea", rows: 6 },
  { key: "language", label: "Language", type: "text" },
  { key: "recipient_type", label: "Recipient Type", type: "text" },
];

export const DOSSIER_FIELDS: FormField[] = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "slug", label: "Slug", type: "text", required: true },
  { key: "issue", label: "Issue", type: "text" },
  { key: "language", label: "Language", type: "text" },
  { key: "format", label: "Format", type: "text" },
  { key: "html_content", label: "HTML Content", type: "richtext", rows: 8 },
];

// ── Content type registry ────────────────────────────────────────────────────

export interface ContentTypeConfig {
  /** Supabase table name. */
  contentType: string;
  title: string;
  listPath: string;
  columns: Column<Record<string, unknown>>[];
  fields: FormField[];
  statusFilter?: string[];
}

export const CONTENT_TYPES: ContentTypeConfig[] = [
  {
    contentType: "evidence_items",
    title: "Evidence Items",
    listPath: "/admin/evidence",
    columns: EVIDENCE_COLUMNS,
    fields: EVIDENCE_FIELDS,
    statusFilter: ["draft", "review_pending", "reviewed", "published", "archived"],
  },
  {
    contentType: "sources",
    title: "Sources",
    listPath: "/admin/sources",
    columns: SOURCE_COLUMNS,
    fields: SOURCE_FIELDS,
  },
  {
    contentType: "countries",
    title: "Countries",
    listPath: "/admin/countries",
    columns: COUNTRY_COLUMNS,
    fields: COUNTRY_FIELDS,
  },
  {
    contentType: "organizations",
    title: "Organizations",
    listPath: "/admin/organizations",
    columns: ORGANIZATION_COLUMNS,
    fields: ORGANIZATION_FIELDS,
  },
  {
    contentType: "legal_cases",
    title: "Legal Cases",
    listPath: "/admin/legal-cases",
    columns: LEGAL_CASE_COLUMNS,
    fields: LEGAL_CASE_FIELDS,
  },
  {
    contentType: "actions",
    title: "Actions",
    listPath: "/admin/actions",
    columns: ACTION_COLUMNS,
    fields: ACTION_FIELDS,
  },
  {
    contentType: "dossiers",
    title: "Dossiers",
    listPath: "/admin/dossiers",
    columns: DOSSIER_COLUMNS,
    fields: DOSSIER_FIELDS,
  },
];
