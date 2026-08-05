import type { EvidenceItem, EvidenceCategory } from '../../data/evidenceItems';
import type { LegalCaseEntry } from '../../data/legalCases';
import type { CountryEntry } from '../../data/countries';
import type { OrganizationRecord } from '../../data/organizations';
import type { ActionTemplate } from '../../data/actionTemplates';
import type {
  ContentStatus,
  DossierRecord,
  SourceRecord,
  SourceType,
  VerificationLevel,
} from '../../types/content';

/**
 * Optional filters accepted by ContentRepository#getEvidenceList.
 *
 * Every field is optional; a null or undefined field means "no filter".
 * Mirrors the shape used by the Evidence Library filter controls.
 */
export interface EvidenceFilters {
  category?: EvidenceCategory | null;
  sourceType?: SourceType | null;
  verificationLevel?: VerificationLevel | null;
  contentStatus?: ContentStatus | null;
}

/**
 * Single source of truth contract for public page data access.
 *
 * Implementors must return reviewed, publishable records only.
 */
export interface ContentRepository {
  getEvidenceList(filters?: EvidenceFilters): Promise<EvidenceItem[]>;
  getEvidenceBySlug(slug: string): Promise<EvidenceItem | null>;
  getLegalCases(): Promise<LegalCaseEntry[]>;
  getLegalCaseBySlug(slug: string): Promise<LegalCaseEntry | null>;
  getCountries(): Promise<CountryEntry[]>;
  getCountryBySlug(slug: string): Promise<CountryEntry | null>;
  getOrganizations(): Promise<OrganizationRecord[]>;
  getOrganizationBySlug(slug: string): Promise<OrganizationRecord | null>;
  getActions(): Promise<ActionTemplate[]>;
  getActionBySlug(slug: string): Promise<ActionTemplate | null>;
  getSources(): Promise<SourceRecord[]>;
  getSourceById(id: string): Promise<SourceRecord | null>;
  getDossiers(): Promise<DossierRecord[]>;
  getDossierBySlug(slug: string): Promise<DossierRecord | null>;
}
