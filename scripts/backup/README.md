# Supabase backup

A complete, offline copy of everything Supabase holds for both apps, in
formats that restore into any Postgres host, not only Supabase.

| Folder | Contents |
| --- | --- |
| `database/full.dump` | Every schema: app tables, functions, triggers, RLS policies, views, `invoice_seq`, **plus** `auth.users` (bcrypt password hashes, Google identities) and the signup trigger and storage policies that live in Supabase's own schemas |
| `database/full-schema.sql` | The same schema as readable SQL. Unlike `supabase/*.sql` in this repo, this is what is actually live |
| `storage/` | Every file in `saree-images` and `vendor-docs`, with `index.json` mapping each to its original object name |
| `config/` | Auth providers, redirect URLs, email templates, Storage and API settings (only with `SUPABASE_ACCESS_TOKEN`) |
| `manifest.json` | Row counts per table, file counts per bucket, anything skipped |
| `SHA256SUMS.txt` | Checksums, so corruption is detectable years later |

## One-time setup

1. **Docker Desktop** running, and **Node 22+**. Nothing else to install.
2. **Create a read-only backup login.** Supabase recommends this for `pg_dump`.
   In Dashboard → SQL Editor, run:
   ```sql
   create role backup_reader with login password 'CHOOSE-A-LONG-RANDOM-PASSWORD' bypassrls;
   grant pg_read_all_data to backup_reader;
   alter role backup_reader set default_transaction_read_only = on;
   ```
   `bypassrls` lets it see every row despite RLS, `pg_read_all_data` covers
   every schema including `auth` and `storage`, and read-only means a leaked
   backup credential cannot change anything.
3. Copy `.env.backup.example` to `.env.backup.local` (same folder, gitignored)
   and fill it in. The comments say where each value comes from.

## Run

From the repo root:

```bash
node scripts/backup/backup.mjs     # writes ../pratyagrasilks-backups/<date_time>/
node scripts/backup/verify.mjs     # restores the newest backup into a throwaway Postgres and checks it
```

`verify.mjs` checks every checksum and every Storage file. It then restores
`full.dump` into a plain Postgres container and confirms that every table
has every row and that all functions, triggers, policies, views and the
invoice sequence came back. Don't treat a backup as done until verify passes.

Run it when the shops are quiet. Row counts are taken before and after the
dump, so orders placed mid-backup don't show up as false alarms.

**Optional:** with the `postgres` login in `SUPABASE_DB_URL` instead of
`backup_reader`, `database/supabase-cli/` is also written. It holds the
roles/schema/data files that Supabase's migration guide restores from.
`full.dump` already contains everything in them.

## Afterwards

The folder holds customer names, phones and addresses, password hashes and
vendor KYC documents. Encrypt it, for example as a 7-Zip archive with
AES-256 and a strong password, and keep two copies in different places,
such as an external drive and private cloud storage. Store the password
separately from the archive.

Not in Supabase, so record these yourself:
- the Google Cloud OAuth client behind "Sign in with Google"
- each Vercel project's environment variables

## Restoring later

**Any Postgres** (Neon, RDS, a VPS…):
```bash
pg_restore --no-owner --no-privileges -d "<new db url>" database/full.dump
```
RLS policies name Supabase's roles (`anon`, `authenticated`), so create
those roles first or expect the policies to fail. `verify.mjs` shows the
exact recipe. Policies call `auth.uid()`, which needs a replacement outside
Supabase.

**A new Supabase project:** restore the `public` schema and the `auth` /
`storage` data from `full.dump` (or follow Supabase's migration guide with
the `supabase-cli/` files). Then recreate the `on_auth_user_created` trigger
and the `storage.objects` policies from `full-schema.sql`, and upload
`storage/<bucket>/` to the same paths. Users keep their passwords.

**Either way:** image URLs are stored in full, with the old project's address
(`products.images`, blog image columns, `customers.avatar_url`, avatar in
`auth.users` metadata). Rewrite them to the new address, update the Vercel
env vars, and add the new auth callback URL in Google Cloud Console.
