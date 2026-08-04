# Backup and Recovery — Arbor Sentinel

## Backup Schedule

| Type | Frequency | Retention | Storage |
|---|---|---|---|
| Full backup | Daily at 03:00 UTC | 30 days | Encrypted, separate region |
| WAL archive | Continuous (hourly) | 7 days | Same as full backup |
| Pre-migration backup | Before every migration | 90 days | Manual retention |

## Running Backups

```bash
# Full backup
./scripts/backup.sh --full

# Verify latest backup
./scripts/backup.sh --verify

# Cleanup old backups
./scripts/backup.sh --cleanup
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_DB_URL` | Yes | PostgreSQL connection string |
| `BACKUP_DIR` | No | Backup directory (default: `./backups`) |
| `BACKUP_ENCRYPTION_KEY` | No | GPG key for encryption |

## Recovery Procedures

### Full Restore from Backup

1. Locate the backup file: `ls -t backups/full-* | head -1`
2. If encrypted: `gpg --decrypt backup.sql.gz.gpg > backup.sql.gz`
3. Restore: `pg_restore --dbname=$DB_URL --clean --if-exists backup.sql.gz`

### Point-in-Time Recovery

1. Restore latest full backup
2. Apply WAL files up to the desired point
3. Use `pg_wal_replay` to replay to the target timestamp

### Selective Table Restore

```bash
pg_restore --dbname=$DB_URL --table=sources backup.sql.gz
pg_restore --dbname=$DB_URL --table=evidence_items backup.sql.gz
```

## Restore Testing

```bash
# Requires TEST_DB_URL (temporary database)
./scripts/restore-test.sh
```

Automated restore tests run weekly. Manual restore tests before/after schema migrations.

## Data Retention

| Data Type | Retention |
|---|---|
| Published content | Indefinite |
| Draft content | 1 year (auto-purged) |
| Audit logs | 3 years |
| Correction submissions | 2 years |
| Superseded versions | 3 years (archived, then purged) |
| Backups | 30 days |

## Emergency Recovery

1. Identify the incident timestamp
2. Determine the closest backup before the incident
3. Create a new temporary database
4. Restore backup to temporary database
5. Verify data integrity
6. Point application to recovered database
7. Investigate root cause before restoring production traffic
