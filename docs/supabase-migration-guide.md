# Supabase Migration Guide — Arbor Sentinel

This guide covers how to migrate the Arbor Sentinel from local/static data to a production Supabase backend.

## Prerequisites

1. **Supabase account** — Create a project at [supabase.com](https://supabase.com)
2. **Supabase CLI** — Install: `npm install -g supabase` or see [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
3. **Node.js 18+** — Already installed if you're running this project

## Step 1: Set Up Supabase Project

### 1a. Create the project

```bash
# Log in to Supabase
supabase login

# Initialize Supabase in the project (already done — supabase/ directory exists)
# If starting fresh:
# supabase init

# Link to your Supabase project
supabase link --project-ref <your-project-ref>
```

### 1b. Configure environment variables

Add these to your `.env` file (never commit):

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_DB_URL=postgresql://postgres:<db-password>@db.<your-project-ref>.supabase.co:5432/postgres
```

Find these in your Supabase dashboard under **Settings > API** and **Settings > Database**.

### 1c. Update supabase/config.toml

Replace the placeholder values in `supabase/config.toml` with your project ID:
```toml
[project]
id = "<your-project-ref>"
```

## Step 2: Run Database Migrations

All schema changes are versioned in `supabase/migrations/`. Run them in order:

```bash
# Push migrations to your Supabase project
supabase db push

# Or run against a local development database
supabase db reset
```

Migrations are applied in numeric order:
1. `00001` — Initial schema (18 tables, extensions, indexes)
2. `00002` — Row-Level Security policies
3. `00003` — Auth schema (sessions, 2FA, triggers)
4. `00004` — Full-text search (tsvector columns, triggers, search function)
5. `00005` — PostGIS spatial columns and functions
6. `00006` — Audit logging triggers on all CRUD tables
7. `00007` — Data retention policies

Verify migrations applied:
```bash
supabase migration list
```

## Step 3: Configure Authentication

### 3a. Supabase Auth settings

In the Supabase dashboard under **Authentication > Settings**:

- **Site URL:** `https://yourdomain.com`
- **Redirect URLs:** Add `https://yourdomain.com/admin/login`
- **Enable email confirmations:** Required for security
- **Minimum password length:** 12 characters

### 3b. Disable public sign-ups

In **Authentication > Providers > Email**:
- Disable "Enable Sign Up" (admin accounts are invite-only)

### 3c. Create the first admin user

```sql
-- Run this in the Supabase SQL Editor
-- First, create the user via the Supabase dashboard (Authentication > Users > Add User)
-- Then assign the admin role:
INSERT INTO user_roles (user_id, role)
VALUES ('<user-uuid-from-auth>', 'admin');
```

## Step 4: Seed Reference Data

```bash
# Option A: Run the seed SQL file (reference data only)
psql "$SUPABASE_DB_URL" -f supabase/seed.sql

# Option B: Run the TypeScript migration (converts all static data)
npx tsx src/data/migration.ts
```

The migration script is idempotent — you can run it multiple times without duplicating data.

## Step 5: Configure Storage

Run the storage bucket configuration:

```bash
# In Supabase SQL Editor, run:
# supabase/storage/buckets.sql
```

This creates two buckets:
- `evidence-documents` — private, admin upload only
- `dossier-exports` — public, generated content

## Step 6: Deploy Edge Functions (if using)

```bash
# Deploy all edge functions
supabase functions deploy api/v1/evidence
supabase functions deploy api/v1/countries
# ... etc.

# Or link and deploy all at once
supabase link --project-ref <your-project-ref>
supabase functions deploy --all
```

## Step 7: Verify Everything

### Schema verification
```bash
# Check table count
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
# Expected: 18 tables
```

### RLS verification
```bash
psql "$SUPABASE_DB_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true ORDER BY tablename;"
# Expected: all 18 tables listed
```

### Search verification
```bash
psql "$SUPABASE_DB_URL" -c "SELECT * FROM search_all('ceasefire');"
```

### Spatial verification
```bash
psql "$SUPABASE_DB_URL" -c "SELECT PostGIS_Version();"
psql "$SUPABASE_DB_URL" -c "SELECT * FROM evidence_nearby(50.85, 4.35, 100);"
```

### Test suite
```bash
npm test
# Expected: 145/146 test files passing (1 pre-existing AutoRefreshProvider failure)
```

## Step 8: Set Up Automated Backups

```bash
# Make backup script executable
chmod +x scripts/backup.sh scripts/restore-test.sh

# Test a manual backup
SUPABASE_DB_URL="$SUPABASE_DB_URL" ./scripts/backup.sh --full

# Verify the backup
./scripts/backup.sh --verify

# Set up daily cron job
# Add to crontab:
# 0 3 * * * cd /path/to/project && SUPABASE_DB_URL="..." ./scripts/backup.sh --full
```

See `docs/backup-recovery.md` for detailed recovery procedures.

## Step 9: Switch Frontend to Database

Update your `.env` file with the Supabase credentials. The frontend will use:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for public/authenticated reads (respects RLS)
- Query modules in `src/lib/db/queries/` for typed data access
- `src/lib/api/client.ts` for REST API calls

The static data in `src/data/` remains available as fallback/test data.

## Key Files Reference

| File | Purpose |
|---|---|
| `supabase/config.toml` | Project configuration |
| `supabase/migrations/00001_*.sql` | Schema (18 tables) |
| `supabase/migrations/00002_*.sql` | RLS policies |
| `supabase/migrations/00003_*.sql` | Auth (sessions, 2FA) |
| `supabase/migrations/00004_*.sql` | Full-text search |
| `supabase/migrations/00005_*.sql` | PostGIS spatial |
| `supabase/migrations/00006_*.sql` | Audit logging |
| `supabase/migrations/00007_*.sql` | Data retention |
| `supabase/seed.sql` | Reference seed data |
| `src/lib/db/client.ts` | Supabase client init |
| `src/lib/db/types.ts` | TypeScript DB types |
| `src/lib/db/queries/*.ts` | Typed query modules |
| `src/lib/auth/*.ts` | Auth, roles, 2FA, session |
| `src/lib/api/client.ts` | REST API client |
| `src/lib/api/types.ts` | API types |
| `src/lib/search/fts.ts` | Full-text search |
| `src/lib/map/spatial.ts` | Spatial queries |
| `src/lib/audit/*.ts` | Audit log client |
| `src/data/migration.ts` | Static → DB migration |
| `scripts/backup.sh` | Automated backup |
| `scripts/restore-test.sh` | Backup verification |
| `docs/data-model.md` | Complete schema docs |
| `docs/api-documentation.md` | API reference |
| `docs/backup-recovery.md` | Recovery procedures |
| `docs/audit-logging.md` | Audit log guide |

## Rollback

To revert to static-only mode:
```bash
# Remove Supabase environment variables
# The app falls back to in-memory/local storage if Supabase is not configured

# Or roll back migrations:
supabase db reset
```
