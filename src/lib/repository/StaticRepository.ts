import type { ContentRepository } from './types';
import { evidenceItems, getEvidenceBySlug } from '../../data/evidenceItems';
import { legalCases, getLegalCaseBySlug } from '../../data/legalCases';
import { getActiveCountries, getCountryBySlug } from '../../data/countries';
import {
  getOrganizationsByCategory,
  getOrganizationBySlug,
} from '../../data/organizations';
import { getActiveTemplates, getTemplateBySlug } from '../../data/actionTemplates';
import { sources, getSourceById } from '../../data/sources';
import { dossiers, getDossierBySlug } from '../../data/dossiers';

/**
 * ContentRepository backed by the static src/data/* modules.
 *
 * Records are returned as-is; the module data is already treated as reviewed
 * and publishable. getOrganizations flattens the category-grouped record into
 * a single array to match the ContentRepository contract.
 */
export class StaticRepository implements ContentRepository {
  async getEvidenceList() {
    return evidenceItems;
  }

  async getEvidenceBySlug(slug: string) {
    return getEvidenceBySlug(slug) ?? null;
  }

  async getLegalCases() {
    return legalCases;
  }

  async getLegalCaseBySlug(slug: string) {
    return getLegalCaseBySlug(slug) ?? null;
  }

  async getCountries() {
    return getActiveCountries();
  }

  async getCountryBySlug(slug: string) {
    return getCountryBySlug(slug) ?? null;
  }

  async getOrganizations() {
    return Object.values(getOrganizationsByCategory()).flat();
  }

  async getOrganizationBySlug(slug: string) {
    return getOrganizationBySlug(slug) ?? null;
  }

  async getActions() {
    return getActiveTemplates();
  }

  async getActionBySlug(slug: string) {
    return getTemplateBySlug(slug) ?? null;
  }

  async getSources() {
    return sources;
  }

  async getSourceById(id: string) {
    return getSourceById(id) ?? null;
  }

  async getDossiers() {
    return dossiers;
  }

  async getDossierBySlug(slug: string) {
    return getDossierBySlug(slug) ?? null;
  }
}
