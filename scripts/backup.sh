#!/usr/bin/env bash
# ============================================================================
# Arbor Sentinel — Automated Database Backup
# Usage: ./scripts/backup.sh [--full] [--wal]
#
# Full backup: pg_dump of the entire database
# WAL archive: continuous WAL archiving for point-in-time recovery
#
# Requires environment variables:
#   SUPABASE_DB_URL — PostgreSQL connection string
#   BACKUP_DIR — backup storage directory (default: ./backups)
#   BACKUP_ENCRYPTION_KEY — GPG key for backup encryption (optional)
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ── Configuration ─────────────────────────────────────────────────────────────

BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
DB_URL="${SUPABASE_DB_URL:-}"
RETENTION_DAYS=30
DATE_STAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")

# ── Validate ──────────────────────────────────────────────────────────────────

if [ -z "$DB_URL" ]; then
  echo "ERROR: SUPABASE_DB_URL environment variable is required."
  echo "Set it to your Supabase PostgreSQL connection string."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# ── Full backup ───────────────────────────────────────────────────────────────

do_full_backup() {
  local backup_file="$BACKUP_DIR/full-$DATE_STAMP.sql.gz"
  echo "Starting full backup to $backup_file..."

  pg_dump "$DB_URL" \
    --format=custom \
    --compress=9 \
    --no-owner \
    --no-acl \
    --file="$backup_file"

  # Encrypt backup if encryption key is configured
  if [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
    echo "Encrypting backup..."
    gpg --batch --yes --encrypt \
      --recipient "$BACKUP_ENCRYPTION_KEY" \
      --output "$backup_file.gpg" \
      "$backup_file"
    rm "$backup_file"
    backup_file="$backup_file.gpg"
  fi

  echo "Full backup complete: $backup_file ($(du -h "$backup_file" | cut -f1))"
}

# ── Cleanup old backups ───────────────────────────────────────────────────────

cleanup_old_backups() {
  echo "Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "full-*" -mtime +$RETENTION_DAYS -delete
  find "$BACKUP_DIR" -name "wal-*" -mtime +$RETENTION_DAYS -delete
  echo "Cleanup complete."
}

# ── Verify backup ─────────────────────────────────────────────────────────────

verify_backup() {
  local latest_backup
  latest_backup=$(find "$BACKUP_DIR" -name "full-*" -type f | sort | tail -1)

  if [ -z "$latest_backup" ]; then
    echo "WARNING: No backup found to verify."
    return 1
  fi

  echo "Verifying latest backup: $latest_backup"

  # For custom format backups, use pg_restore --list
  if [[ "$latest_backup" == *.gpg ]]; then
    gpg --batch --decrypt "$latest_backup" | pg_restore --list > /dev/null
  else
    pg_restore --list "$latest_backup" > /dev/null
  fi

  echo "Backup verification passed."
}

# ── Main ──────────────────────────────────────────────────────────────────────

case "${1:-}" in
  --full)
    do_full_backup
    cleanup_old_backups
    ;;
  --verify)
    verify_backup
    ;;
  --cleanup)
    cleanup_old_backups
    ;;
  *)
    echo "Usage: $0 [--full | --verify | --cleanup]"
    echo ""
    echo "  --full     Perform a full database backup"
    echo "  --verify   Verify the latest backup integrity"
    echo "  --cleanup  Remove backups older than $RETENTION_DAYS days"
    exit 1
    ;;
esac
