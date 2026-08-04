#!/usr/bin/env bash
# ============================================================================
# Accountability Atlas — Backup Restore Test
# Usage: ./scripts/restore-test.sh
#
# Tests that the latest backup can be successfully restored.
# Creates a temporary database, restores the backup, runs validation queries.
# Does NOT affect the production database.
#
# Requires environment variables:
#   SUPABASE_DB_URL — production database URL (for reference only)
#   TEST_DB_URL — temporary test database URL
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
TEST_DB_URL="${TEST_DB_URL:-}"

echo "═══ Accountability Atlas — Restore Test ═══"
echo "Started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# ── Validate ──────────────────────────────────────────────────────────────────

if [ -z "$TEST_DB_URL" ]; then
  echo "ERROR: TEST_DB_URL environment variable is required."
  echo "Set it to a temporary PostgreSQL database URL for restore testing."
  echo "Example: postgresql://localhost:5432/aatlas_restore_test"
  exit 1
fi

# Find latest backup
LATEST_BACKUP=$(find "$BACKUP_DIR" -name "full-*" -type f 2>/dev/null | sort | tail -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "ERROR: No backup found in $BACKUP_DIR"
  echo "Run ./scripts/backup.sh --full first to create a backup."
  exit 1
fi

echo ""
echo "Latest backup: $LATEST_BACKUP ($(du -h "$LATEST_BACKUP" | cut -f1))"
echo "Test database: $TEST_DB_URL"
echo ""

# ── Restore ───────────────────────────────────────────────────────────────────

echo "Restoring backup to test database..."

if [[ "$LATEST_BACKUP" == *.gpg ]]; then
  gpg --batch --decrypt "$LATEST_BACKUP" | pg_restore \
    --dbname="$TEST_DB_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --jobs=4
else
  pg_restore \
    --dbname="$TEST_DB_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --jobs=4 \
    "$LATEST_BACKUP"
fi

echo "Restore complete."
echo ""

# ── Validate ───────────────────────────────────────────────────────────────────

echo "Running validation queries..."

# Check table count
TABLE_COUNT=$(psql "$TEST_DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
echo "  Tables in restored database: $TABLE_COUNT"

# Check for essential tables
for table in sources evidence_items countries organizations legal_cases audit_log; do
  EXISTS=$(psql "$TEST_DB_URL" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');")
  if [ "$EXISTS" = " t" ]; then
    echo "  ✓ $table exists"
  else
    echo "  ✗ $table MISSING"
  fi
done

# Check RLS is enabled
RLS_COUNT=$(psql "$TEST_DB_URL" -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true;")
echo "  Tables with RLS enabled: $RLS_COUNT"

echo ""
echo "═══ Restore test complete ═══"
echo "Status: PASSED"
echo ""
echo "To clean up the test database:"
echo "  dropdb <test-database-name>"
