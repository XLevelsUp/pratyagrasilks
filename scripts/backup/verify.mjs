#!/usr/bin/env node
// Proves a backup made by backup.mjs is complete and restorable:
//
//   1. every file still matches SHA256SUMS.txt
//   2. every Storage file listed in storage/index.json is on disk
//   3. database/full.dump restores into a fresh, plain Postgres container,
//      and its row counts, functions, triggers, policies, views and sequence
//      positions match what the live database reported at backup time
//
// Plain Postgres rather than Supabase's image on purpose: if the restore
// works there, the data is not locked to Supabase.
//
// Usage:  node scripts/backup/verify.mjs [backup-folder]   (default: newest)
import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { INSPECT_SQL, PG_IMAGE, docker, ensureDocker, lastLines, loadConfig, parseInspect } from './lib.mjs';

const cfg = loadConfig();

async function newestBackup() {
    const dirs = existsSync(cfg.backupRoot)
        ? (await readdir(cfg.backupRoot)).filter((d) => /^\d{4}-\d{2}-\d{2}_\d+$/.test(d)).sort()
        : [];
    if (!dirs.length) throw new Error(`No backups found in ${cfg.backupRoot}`);
    return path.join(cfg.backupRoot, dirs.at(-1));
}

const dir = process.argv[2] ? path.resolve(process.argv[2]) : await newestBackup();
const manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
const problems = [];
const notes = [];
console.log(`Verifying ${dir}`);

// ── 1. Checksums ─────────────────────────────────────────────────────────────

{
    console.log('\n▶ Checksums');
    const lines = (await readFile(path.join(dir, 'SHA256SUMS.txt'), 'utf8')).trim().split('\n');
    let bad = 0;
    for (const line of lines) {
        const [expected, file] = [line.slice(0, 64), line.slice(66)];
        const full = path.join(dir, ...file.split('/'));
        if (!existsSync(full)) {
            problems.push(`missing file: ${file}`);
            bad++;
            continue;
        }
        const hash = createHash('sha256');
        await pipeline(createReadStream(full), hash);
        if (hash.digest('hex') !== expected) {
            problems.push(`file changed or corrupted: ${file}`);
            bad++;
        }
    }
    console.log(`  ${lines.length - bad}/${lines.length} files intact`);
}

// ── 2. Storage files ─────────────────────────────────────────────────────────

if (existsSync(path.join(dir, 'storage', 'index.json'))) {
    console.log('\n▶ Storage files');
    const index = JSON.parse(await readFile(path.join(dir, 'storage', 'index.json'), 'utf8'));
    const perBucket = {};
    for (const f of index) {
        const s = await stat(path.join(dir, 'storage', ...f.path.split('/'))).catch(() => null);
        if (!s || s.size !== f.size) problems.push(`storage file missing or wrong size: ${f.bucket}/${f.name}`);
        perBucket[f.bucket] = (perBucket[f.bucket] ?? 0) + 1;
    }
    for (const [bucket, b] of Object.entries(manifest.storage.buckets)) {
        const onDisk = perBucket[bucket] ?? 0;
        console.log(`  ${bucket}: ${onDisk}/${b.listed} files`);
        if (onDisk !== b.listed) problems.push(`${bucket}: ${b.listed} files listed, ${onDisk} backed up`);
        const inDb = manifest.database.before?.objectsByBucket?.[bucket];
        if (inDb != null && inDb !== b.listed) {
            notes.push(`${bucket}: database lists ${inDb} objects, Storage listed ${b.listed} (uploads during the backup cause this)`);
        }
    }
} else {
    notes.push('this backup has no storage/ folder');
}

// ── 3. Restore the database ──────────────────────────────────────────────────

// Supabase's roles. RLS policies name them (TO authenticated, …), so they
// must exist for those policies to restore.
const SUPABASE_ROLES = [
    'anon', 'authenticated', 'service_role', 'authenticator', 'dashboard_user', 'pgbouncer',
    'supabase_admin', 'supabase_auth_admin', 'supabase_storage_admin', 'supabase_realtime_admin',
    'supabase_replication_admin', 'supabase_read_only_user', 'supabase_functions_admin',
    'supabase_etl_admin', 'pgsodium_keyholder', 'pgsodium_keyiduser', 'pgsodium_keymaker',
];

function compareCount(label, live, liveAfter, restored) {
    if (typeof live !== 'number') return notes.push(`${label}: not readable at backup time (${live})`);
    if (restored === undefined) return problems.push(`${label}: missing after restore`);
    if (typeof restored !== 'number') return problems.push(`${label}: unreadable after restore (${restored})`);
    const lo = Math.min(live, liveAfter ?? live);
    const hi = Math.max(live, liveAfter ?? live);
    if (restored < lo || restored > hi) {
        problems.push(`${label}: ${restored} restored, live had ${lo === hi ? lo : `${lo}–${hi}`}`);
    }
}

if (existsSync(path.join(dir, 'database', 'full.dump')) && manifest.database.before) {
    console.log('\n▶ Restore into a fresh Postgres');
    await ensureDocker();
    const name = `pratyagra-restore-check-${Date.now()}`;
    const started = await docker([
        'run', '-d', '--name', name, '-e', 'POSTGRES_PASSWORD=restore-check',
        '--mount', `type=bind,source=${path.join(dir, 'database')},target=/work,readonly`,
        PG_IMAGE,
    ]);
    if (started.code !== 0) throw new Error(`could not start Postgres: ${lastLines(started.stderr)}`);
    const exec = (...args) => docker(['exec', name, ...args]);
    const psql = (...args) => exec('psql', '-U', 'postgres', '-X', '-q', ...args);

    try {
        // The image's init phase runs a socket-only server, so a TCP check only
        // succeeds once the real server is up.
        for (let i = 0; ; i++) {
            if ((await exec('pg_isready', '-h', '127.0.0.1', '-U', 'postgres')).code === 0) break;
            if (i >= 60) throw new Error('Postgres did not start within 60s');
            await delay(1000);
        }

        await psql(
            '-c',
            SUPABASE_ROLES.map(
                (r) => `DO $$ BEGIN CREATE ROLE ${r} NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
            ).join('\n'),
        );
        if (existsSync(path.join(dir, 'database', 'supabase-cli', 'roles.sql'))) {
            await psql('-f', '/work/supabase-cli/roles.sql');
        }

        console.log('  restoring full.dump…');
        const restore = await exec(
            'pg_restore', '-U', 'postgres', '-d', 'postgres', '--no-owner', '--no-privileges', '/work/full.dump',
        );
        const logFile = path.join(dir, 'verify-restore.log');
        await writeFile(logFile, restore.stderr);
        const ignored = Number(restore.stderr.match(/errors ignored on restore: (\d+)/)?.[1] ?? 0);
        if (ignored) {
            notes.push(
                `${ignored} restore error(s), expected on plain Postgres for Supabase-only extensions ` +
                    `(pg_graphql, pgsodium, vault…); details in ${logFile}`,
            );
        }

        const inspected = await psql('-c', INSPECT_SQL);
        if (inspected.code !== 0) throw new Error(lastLines(inspected.stderr));
        const restored = parseInspect(inspected.stderr);
        const { before, after = {} } = manifest.database;
        const excluded = manifest.database.excludedFromFullDump ?? [];
        for (const x of excluded) notes.push(`${x.name}: left out of the dump (the login cannot read it)`);
        const isExcluded = (table) =>
            excluded.some((x) => (x.kind === 'table' && x.name === table) || (x.kind === 'schema' && x.name === table.split('.')[0]));

        let matched = 0;
        for (const [table, live] of Object.entries(before.rows)) {
            if (isExcluded(table)) continue;
            const n = problems.length;
            compareCount(table, live, after.rows?.[table], restored.rows[table]);
            if (problems.length === n) matched++;
        }
        console.log(`  ${matched}/${Object.keys(before.rows).length} tables have every row`);

        for (const [kind, live] of Object.entries(before.schemaObjects)) {
            const got = restored.schemaObjects[kind];
            console.log(`  ${kind}: ${got}/${live}`);
            if (got !== live) problems.push(`${kind}: ${got} restored, live had ${live}`);
        }
        for (const [seq, live] of Object.entries(before.sequences)) {
            console.log(`  sequence ${seq}: at ${restored.sequences[seq]} (live: ${live})`);
            compareCount(`sequence ${seq}`, live, after.sequences?.[seq], restored.sequences[seq]);
        }
    } finally {
        await docker(['rm', '-f', '-v', name]);
    }
} else {
    notes.push('this backup has no database dump');
}

// ── Report ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(72)}`);
for (const n of notes) console.log(`  note: ${n}`);
if (problems.length) {
    console.log(`\nVERIFY FAILED: ${problems.length} problem(s)`);
    for (const p of problems) console.log(`  ✖ ${p}`);
    process.exit(1);
}
console.log('\nVerified: this backup is complete and restores cleanly.');
