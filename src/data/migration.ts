// src/data/migration.ts
// Migration script: converts static TypeScript data files to database records.
// Usage: npx tsx src/data/migration.ts
// Idempotent — can run multiple times without duplicating data.

import { supabaseAdmin } from '../lib/db/client';

// ── Type mapping: camelCase (TS) → snake_case (DB) ────────────────────────────

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function mapRecord<T extends Record<string, unknown>>(
  record: T,
  fieldMap: Record<string, string>,
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [tsKey, dbKey] of Object.entries(fieldMap)) {
    if (tsKey in record) {
      mapped[dbKey] = record[tsKey];
    }
  }
  return mapped;
}

// ── Migration state tracking ──────────────────────────────────────────────────

interface MigrationResult {
  table: string;
  inserted: number;
  updated: number;
  errors: string[];
}

const results: MigrationResult[] = [];

function logResult(result: MigrationResult): void {
  const status = result.errors.length === 0 ? '✓' : '⚠';
  console.log(
    `  ${status} ${result.table}: ${result.inserted} inserted, ${result.updated} updated` +
      (result.errors.length > 0 ? ` (${result.errors.length} errors)` : ''),
  );
  if (result.errors.length > 0) {
    for (const err of result.errors) {
      console.error(`    - ${err}`);
    }
  }
  results.push(result);
}

// ── Upsert helper ─────────────────────────────────────────────────────────────

async function upsertTable(
  table: string,
  records: Record<string, unknown>[],
  conflictColumn: string = 'id',
): Promise<MigrationResult> {
  const result: MigrationResult = { table, inserted: 0, updated: 0, errors: [] };

  for (const record of records) {
    const { error } = await supabaseAdmin
      .from(table)
      .upsert(record, { onConflict: conflictColumn });

    if (error) {
      result.errors.push(`Failed to upsert into ${table}: ${error.message}`);
    } else {
      result.inserted++;
    }
  }

  return result;
}

// ── Migrate sources ───────────────────────────────────────────────────────────

async function migrateSources(): Promise<void> {
  console.log('\n📦 Migrating sources...');

  try {
    const module = await import('../data/sources');
    const sourceList = module.sources || [];

    const fieldMap: Record<string, string> = {
      id: 'id',
      publisher: 'name',
      sourceType: 'type',
      url: 'url',
      country: 'country',
      trustLevel: 'credibility_tier',
      notes: 'notes',
    };

    const records = sourceList.map((s: Record<string, unknown>) => mapRecord(s, fieldMap));
    const result = await upsertTable('sources', records);
    logResult(result);
  } catch (err) {
    logResult({
      table: 'sources',
      inserted: 0,
      updated: 0,
      errors: [String(err)],
    });
  }
}

// ── Migrate countries ─────────────────────────────────────────────────────────

async function migrateCountries(): Promise<void> {
  console.log('\n📦 Migrating countries...');

  // Static country data is embedded in page components — use a reference set
  const countries = [
    { id: 'belgium', name: 'Belgium', iso_code: 'BE', region: 'Europe', eu_member: true, nato_member: true, slug: 'belgium' },
    { id: 'france', name: 'France', iso_code: 'FR', region: 'Europe', eu_member: true, nato_member: true, slug: 'france' },
    { id: 'germany', name: 'Germany', iso_code: 'DE', region: 'Europe', eu_member: true, nato_member: true, slug: 'germany' },
    { id: 'netherlands', name: 'Netherlands', iso_code: 'NL', region: 'Europe', eu_member: true, nato_member: true, slug: 'netherlands' },
    { id: 'european-union', name: 'European Union', iso_code: 'EU', region: 'Europe', eu_member: true, nato_member: false, slug: 'european-union' },
    { id: 'ireland', name: 'Ireland', iso_code: 'IE', region: 'Europe', eu_member: true, nato_member: false, slug: 'ireland' },
    { id: 'spain', name: 'Spain', iso_code: 'ES', region: 'Europe', eu_member: true, nato_member: true, slug: 'spain' },
    { id: 'united-states', name: 'United States', iso_code: 'US', region: 'North America', eu_member: false, nato_member: true, slug: 'united-states' },
    { id: 'united-kingdom', name: 'United Kingdom', iso_code: 'GB', region: 'Europe', eu_member: false, nato_member: true, slug: 'united-kingdom' },
    { id: 'israel', name: 'Israel', iso_code: 'IL', region: 'Middle East', eu_member: false, nato_member: false, slug: 'israel' },
    { id: 'palestine', name: 'Palestine', iso_code: 'PS', region: 'Middle East', eu_member: false, nato_member: false, slug: 'palestine' },
    { id: 'south-africa', name: 'South Africa', iso_code: 'ZA', region: 'Africa', eu_member: false, nato_member: false, slug: 'south-africa' },
  ];

  const result = await upsertTable('countries', countries);
  logResult(result);
}

// ── Migrate organizations ─────────────────────────────────────────────────────

async function migrateOrganizations(): Promise<void> {
  console.log('\n📦 Migrating organizations...');

  try {
    const module = await import('../data/organizations');
    const orgList = module.organizations || [];

    const fieldMap: Record<string, string> = {
      id: 'id',
      name: 'name',
      slug: 'slug',
      organization_type: 'type',
      website: 'website',
      regions: 'regions',
      partnership_status: 'partnership_status',
    };

    const records = orgList.map((o: Record<string, unknown>) => mapRecord(o, fieldMap));
    const result = await upsertTable('organizations', records);
    logResult(result);
  } catch (err) {
    logResult({
      table: 'organizations',
      inserted: 0,
      updated: 0,
      errors: [String(err)],
    });
  }
}

// ── Main migration runner ─────────────────────────────────────────────────────

async function migrate(): Promise<void> {
  console.log('═══ Accountability Atlas — Static Data Migration ═══');
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Target: Supabase at ${import.meta.env.VITE_SUPABASE_URL || '(not set)'}`);

  try {
    await migrateSources();
    await migrateCountries();
    await migrateOrganizations();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n═══ Migration Summary ═══');
  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  console.log(`Tables processed: ${results.length}`);
  console.log(`Total records upserted: ${totalInserted}`);
  console.log(`Total errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log('\n⚠ Migration completed with errors. Review the output above.');
  } else {
    console.log('\n✓ Migration completed successfully.');
  }
}

// ── Run ────────────────────────────────────────────────────────────────────────

migrate().catch((err) => {
  console.error('Unhandled migration error:', err);
  process.exit(1);
});
