// src/lib/repository/SupabaseRepository.ts
// Production ContentRepository backed by the Supabase query modules.
// Each query module filters published/visible records and returns
// `{ data, error }`; this wrapper unwraps the result to return just data.

import type { ContentRepository, EvidenceFilters } from './types';
import type { EvidenceItem } from '../../data/evidenceItems';
import type { LegalCaseEntry } from '../../data/legalCases';
import type { CountryEntry } from '../../data/countries';
import type { OrganizationRecord as DataOrganizationRecord } from '../../data/organizations';
import type { ActionTemplate } from '../../data/actionTemplates';
import type { SourceRecord as ContentSourceRecord, DossierRecord } from '../../types/content';

import { getEvidenceList, getEvidenceBySlug } from '../db/queries/evidence';
import type { EvidenceListParams } from '../db/queries/evidence';
import { getAllLegalCases } from '../db/queries/legalCases';
import { getAllCountries, getCountryBySlug } from '../db/queries/countries';
import { getAllOrganizations, getOrganizationBySlug } from '../db/queries/organizations';
import { getActions, getActionBySlug } from '../db/queries/actions';
import { getAllSources, getSourceById } from '../db/queries/sources';

/**
 * The evidence query module paginates with a default perPage of 20. The
 * ContentRepository contract exposes no pagination surface yet, so pass a large
 * page size to return all published records rather than truncating to one page.
 */
const MAX_EVIDENCE_PAGE_SIZE = 1000;

export class SupabaseRepository implements ContentRepository {
  /**
   * Maps domain `EvidenceFilters` to the query module's `EvidenceListParams`.
   *
   * Supported in Supabase mode:
   * - `category` -> `category`
   * - `verificationLevel` -> `verificationLevel`
   *
   * Not supported in Supabase mode (intentionally dropped):
   * - `sourceType`: the evidence_items table has no source-type column.
   * - `contentStatus`: this repository only returns published records — the
   *   query module hard-filters `review_status = 'published'`, so any other
   *   value would always yield an empty result.
   */
  async getEvidenceList(filters?: EvidenceFilters): Promise<EvidenceItem[]> {
    const params: EvidenceListParams = { perPage: MAX_EVIDENCE_PAGE_SIZE };
    if (filters?.category) params.category = filters.category;
    if (filters?.verificationLevel !== undefined && filters.verificationLevel !== null) {
      params.verificationLevel = filters.verificationLevel;
    }
    const { data } = await getEvidenceList(params);
    return data as unknown as EvidenceItem[];
  }

  async getEvidenceBySlug(slug: string): Promise<EvidenceItem | null> {
    const { data } = await getEvidenceBySlug(slug);
    return data as EvidenceItem | null;
  }

  async getLegalCases(): Promise<LegalCaseEntry[]> {
    const { data } = await getAllLegalCases();
    return data as unknown as LegalCaseEntry[];
  }

  async getLegalCaseBySlug(): Promise<LegalCaseEntry | null> {
    // The legal_cases table has no slug column and no slug-based query module
    // exists yet, so slug lookup is unsupported in Supabase mode.
    return null;
  }

  async getCountries(): Promise<CountryEntry[]> {
    const { data } = await getAllCountries();
    return data as unknown as CountryEntry[];
  }

  async getCountryBySlug(slug: string): Promise<CountryEntry | null> {
    const { data } = await getCountryBySlug(slug);
    return data as CountryEntry | null;
  }

  async getOrganizations(): Promise<DataOrganizationRecord[]> {
    const { data } = await getAllOrganizations();
    return data as unknown as DataOrganizationRecord[];
  }

  async getOrganizationBySlug(slug: string): Promise<DataOrganizationRecord | null> {
    const { data } = await getOrganizationBySlug(slug);
    return data as DataOrganizationRecord | null;
  }

  async getActions(): Promise<ActionTemplate[]> {
    const { data } = await getActions();
    return data as unknown as ActionTemplate[];
  }

  async getActionBySlug(slug: string): Promise<ActionTemplate | null> {
    const { data } = await getActionBySlug(slug);
    return data as ActionTemplate | null;
  }

  async getSources(): Promise<ContentSourceRecord[]> {
    const { data } = await getAllSources();
    return data as unknown as ContentSourceRecord[];
  }

  async getSourceById(id: string): Promise<ContentSourceRecord | null> {
    const { data } = await getSourceById(id);
    return data as ContentSourceRecord | null;
  }

  async getDossiers(): Promise<DossierRecord[]> {
    return []; // No db/queries/dossiers module yet
  }

  async getDossierBySlug(): Promise<DossierRecord | null> {
    return null; // No db/queries/dossiers module yet
  }
}
