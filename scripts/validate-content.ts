#!/usr/bin/env node
/**
 * Static-content integrity validation — CLI entry point.
 *
 * Run via: npx tsx scripts/validate-content.ts
 *      or: npm run validate:content
 *
 * Validates all static data collections against 18 integrity rules.
 * Exits with code 1 if errors are found (for CI integration).
 * Exits with code 0 if only warnings or no issues.
 */

import { validateAll, generateSummary, formatSummary } from "../src/lib/content-validation";

const report = validateAll();
const summary = generateSummary(report);

// Print human-readable summary
console.log(formatSummary(summary, report));

// Exit with appropriate code for CI
if (!report.passed) {
  console.error(`\n❌ Validation FAILED: ${report.errors.length} error(s) found.`);
  process.exit(1);
} else {
  console.log(`\n✅ Validation PASSED: ${report.recordsChecked} records across ${report.collectionsChecked} collections.`);
  if (report.warnings.length > 0) {
    console.log(`⚠  ${report.warnings.length} warning(s) — see above.`);
  }
  process.exit(0);
}
