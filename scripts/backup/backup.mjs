#!/usr/bin/env node
// Complete offline backup of the Supabase project behind both apps:
//
//   database/  every schema, including auth users and the signup trigger and
//              storage policies that live in Supabase-owned schemas
//   storage/   every file in every bucket
//   config/    Auth / Storage / API settings (needs SUPABASE_ACCESS_TOKEN)
//
// Usage:  node scripts/backup/backup.mjs [--skip-db] [--skip-storage]
//                                       [--skip-config] [--skip-supabase-cli]
// Setup and restore notes: scripts/backup/README.md
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { setTimeout as delay } from 'node:timers/promises';
import {
    ENV_FILE,
    INSPECT_SQL,
    PG_IMAGE,
    docker,
    ensureDocker,
    formatBytes,
    lastLines,
    loadConfig,
    parseInspect,
    pgRemote,
    run,
} from './lib.mjs';

const flags = new Set(process.argv.slice(2));
const skip = (part) => flags.has(`--skip-${part}`);
const cfg = loadConfig();

// ── Preflight ────────────────────────────────────────────────────────────────

const missing = [];
if (!skip('db') && !cfg.dbUrl) missing.push('SUPABASE_DB_URL');
if (!skip('storage') && !cfg.supabaseUrl) missing.push('SUPABASE_URL');
if (!skip('storage') && !cfg.serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
if (missing.length) {
    console.error(`Missing ${missing.join(', ')}.`);
    console.error(
        existsSync(ENV_FILE)
            ? `Fill them in ${ENV_FILE}`
            : `Copy ${path.join('scripts', 'backup', '.env.backup.example')} to ${ENV_FILE} and fill it in.`,
    );
    process.exit(1);
}

if (cfg.dbUrl) {
    let url;
    try {
        url = new URL(cfg.dbUrl);
    } catch {
        console.error('SUPABASE_DB_URL is not a valid URL. URL-encode special characters in the password (@ → %40, # → %23).');
        process.exit(1);
    }
    if (url.port === '6543') {
        console.error('SUPABASE_DB_URL points at the transaction pooler (port 6543), which pg_dump cannot use.');
        console.error('Use the "Session pooler" string from Dashboard → Connect (port 5432).');
        process.exit(1);
    }
    if (/^db\.[a-z0-9]+\.supabase\.co$/.test(url.hostname)) {
        console.warn('Note: the direct db.<ref>.supabase.co host is IPv6-only. If the dump cannot connect,');
        console.warn('switch to the "Session pooler" string from Dashboard → Connect.\n');
    }
}

// SUPABASE_PROJECT_REF is only needed if SUPABASE_URL is a custom domain.
const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    cfg.supabaseUrl?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co$/)?.[1] ||
    (cfg.dbUrl && new URL(cfg.dbUrl).username.match(/^[a-z_]+\.([a-z0-9]+)$/)?.[1]) ||
    null;

const stamp = new Date().toLocaleString('sv-SE').replace(' ', '_').replace(/:/g, '').slice(0, 17);
const outDir = path.join(cfg.backupRoot, stamp);
const dbDir = path.join(outDir, 'database');
const storageDir = path.join(outDir, 'storage');
const configDir = path.join(outDir, 'config');

const manifest = {
    createdAt: new Date().toISOString(),
    projectRef,
    steps: {},
    database: {},
    storage: { buckets: {} },
    config: {},
};

async function step(name, fn) {
    console.log(`\n▶ ${name}`);
    try {
        const result = await fn();
        const skipped = typeof result === 'string' && result.startsWith('skipped');
        manifest.steps[name] = skipped ? result : 'ok';
        console.log(skipped ? `– ${name}: ${result}` : `✔ ${name}`);
    } catch (err) {
        manifest.steps[name] = `failed: ${err.message}`;
        console.error(`✖ ${name} failed:\n${err.message.replace(/^/gm, '    ')}`);
    }
}

// ── Database ─────────────────────────────────────────────────────────────────

async function inspectDatabase() {
    const r = await pgRemote('psql', ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '-c', INSPECT_SQL], {
        dbUrl: cfg.dbUrl,
    });
    if (r.code !== 0) throw new Error(lastLines(r.stderr));
    const result = parseInspect(r.stderr);
    for (const [table, n] of Object.entries(result.rows)) {
        if (typeof n !== 'number') console.warn(`  ! cannot count ${table}: ${n}`);
    }
    return result;
}

const RLS_HELP =
    'The database login is subject to row-level security, so it cannot see every row.\n' +
    'Use the backup_reader login from README.md (it has BYPASSRLS), or the "postgres" user.';

// pg_dump aborts on the first thing the login cannot read. Supabase's
// backup_reader role (pg_read_all_data) reads every table but not large
// objects; other logins may lack whole tables or schemas. A table error names
// it unqualified ("permission denied for table secrets"); the failing query
// (LOCK TABLE / COPY / SELECT) has the qualified name.
function unreadable(stderr) {
    if (stderr.includes('permission denied for large object')) {
        return { kind: 'large-objects', name: 'large objects', arg: '--no-large-objects' };
    }
    const schema = stderr.match(/permission denied for schema "?([^"\s]+)"?/)?.[1];
    if (schema) return { kind: 'schema', name: schema, arg: `--exclude-schema=${schema}` };
    const name = stderr.match(/permission denied for (?:table|sequence|view|materialized view) "?([^"\s]+)"?/)?.[1];
    const query = stderr.match(/Query was: (.*)/)?.[1];
    if (!name || !query) return null;
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const qualified = query.match(new RegExp(`((?:"[^"]+"|[\\w$]+)\\.(?:"${esc}"|${esc}))(?=[\\s,;(]|$)`))?.[1];
    return qualified && { kind: 'table', name: qualified.replace(/"/g, ''), arg: `--exclude-table=${qualified}` };
}

async function dumpFull() {
    await mkdir(dbDir, { recursive: true });
    const excluded = [];
    for (;;) {
        const args = ['--format=custom', '--file=/work/full.dump', ...excluded.map((x) => x.arg)];
        const r = await pgRemote('pg_dump', args, { dbUrl: cfg.dbUrl, mount: dbDir });
        if (r.code === 0) break;
        // Never work around this one: skipping the table would lose its rows.
        if (r.stderr.includes('would be affected by row-level security')) {
            throw new Error(`${RLS_HELP}\n${lastLines(r.stderr, 2)}`);
        }
        const blocked = unreadable(r.stderr);
        if (!blocked || excluded.some((x) => x.arg === blocked.arg) || excluded.length >= 25) {
            throw new Error(lastLines(r.stderr));
        }
        console.warn(`  ! the database login cannot read ${blocked.name}; dumping without it`);
        excluded.push(blocked);
    }
    manifest.database.excludedFromFullDump = excluded.map(({ kind, name }) => ({ kind, name }));

    // Readable copy of the complete schema (every function, trigger and
    // policy, auth/storage included), extracted from the archive locally.
    const r = await docker([
        'run', '--rm', '--mount', `type=bind,source=${dbDir},target=/work`, PG_IMAGE,
        'pg_restore', '--schema-only', '--file=/work/full-schema.sql', '/work/full.dump',
    ]);
    if (r.code !== 0) throw new Error(`could not extract schema: ${lastLines(r.stderr)}`);

    const size = (await stat(path.join(dbDir, 'full.dump'))).size;
    console.log(`  full.dump ${formatBytes(size)}`);
}

// Supabase's own documented format (roles / schema / data), which is what
// their migration guide restores into a new Supabase project. The CLI
// switches to the postgres role, so it only works with the postgres login;
// full.dump holds everything regardless.
async function dumpSupabaseFormat() {
    const user = decodeURIComponent(new URL(cfg.dbUrl).username);
    if (!/^postgres(\.[a-z0-9]+)?$/.test(user)) {
        return 'skipped: needs the postgres login (full.dump already holds everything)';
    }
    const toolsDir = path.join(cfg.backupRoot, '.tools', 'supabase-cli');
    const pkgDir = path.join(toolsDir, 'node_modules', 'supabase');
    // The package's bin has been both a native binary and a Node launcher
    // across versions, so resolve it from package.json rather than guessing.
    const findBin = async () => {
        try {
            const { bin } = JSON.parse(await readFile(path.join(pkgDir, 'package.json'), 'utf8'));
            const rel = typeof bin === 'string' ? bin : bin?.supabase;
            const file = rel && path.join(pkgDir, rel);
            if (!file || !existsSync(file)) return null;
            return file.endsWith('.js') ? [process.execPath, file] : [file];
        } catch {
            return null;
        }
    };

    let bin = await findBin();
    if (!bin) {
        console.log('  installing the Supabase CLI (first run only)…');
        await mkdir(toolsDir, { recursive: true });
        if (!existsSync(path.join(toolsDir, 'package.json'))) {
            await writeFile(path.join(toolsDir, 'package.json'), '{ "private": true }\n');
        }
        const args = ['install', 'supabase', '--no-audit', '--no-fund', '--loglevel=error'];
        // Run npm's own entry point with this Node, avoiding npm.cmd and the
        // shell it would need on Windows.
        const npmCli = [
            path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
            path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
        ].find((p) => existsSync(p));
        const r = npmCli
            ? await run(process.execPath, [npmCli, ...args], { cwd: toolsDir })
            : await run('npm', args, { cwd: toolsDir, shell: process.platform === 'win32' });
        bin = await findBin();
        if (r.code !== 0 || !bin) {
            throw new Error(`could not install the Supabase CLI:\n${lastLines(`${r.stdout}\n${r.stderr}`)}`);
        }
    }

    const out = path.join(dbDir, 'supabase-cli');
    await mkdir(out, { recursive: true });
    const dumps = [
        ['roles.sql', ['--role-only']],
        ['schema.sql', []],
        ['data.sql', ['--data-only', '--use-copy']],
    ];
    for (const [file, extra] of dumps) {
        console.log(`  ${file}`);
        // Spawned without a shell (and the launcher spawns the native binary
        // the same way), so the URL arrives verbatim whatever the password holds.
        const [exe, ...pre] = bin;
        const r = await run(exe, [...pre, 'db', 'dump', '--db-url', cfg.dbUrl, '-f', path.join(out, file), ...extra], {
            cwd: out,
            tee: true,
        });
        if (r.code !== 0) throw new Error(`${file}: ${lastLines(r.stderr)}`);
    }
}

// ── Storage ──────────────────────────────────────────────────────────────────

function storageApi() {
    return async (p, init = {}) => {
        const res = await fetch(cfg.supabaseUrl + p, {
            ...init,
            headers: { apikey: cfg.serviceKey, Authorization: `Bearer ${cfg.serviceKey}`, ...init.headers },
        });
        if (!res.ok) {
            const body = (await res.text().catch(() => '')).slice(0, 200);
            throw new Error(`${init.method ?? 'GET'} ${p} → HTTP ${res.status} ${body}`);
        }
        return res;
    };
}

// The list endpoint returns one folder level at a time; folders have id null.
// Paging stops on an empty page rather than a short one, so a server-side cap
// on `limit` can never silently truncate the listing.
async function listAll(api, bucket, prefix = '') {
    const files = [];
    for (let offset = 0; ; ) {
        const res = await api(`/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
        });
        const page = await res.json();
        if (!Array.isArray(page) || page.length === 0) break;
        offset += page.length;
        for (const item of page) {
            const name = prefix + item.name;
            if (item.id == null) files.push(...(await listAll(api, bucket, `${name}/`)));
            else
                files.push({
                    name,
                    size: item.metadata?.size ?? null,
                    mimetype: item.metadata?.mimetype ?? null,
                    updatedAt: item.updated_at ?? null,
                });
        }
    }
    return files;
}

// Object names may legally contain characters Windows forbids in filenames.
function safeSegment(s) {
    let out = s.replace(/[<>:"\\|?*\x00-\x1f]/g, '_').replace(/[. ]+$/, (m) => '_'.repeat(m.length));
    if (/^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i.test(out)) out = `_${out}`;
    return out || '_';
}

async function download(api, bucket, file, dest) {
    await mkdir(path.dirname(dest), { recursive: true });
    const url = `/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${file.name
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
    for (let attempt = 1; ; attempt++) {
        try {
            const res = await api(url);
            await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
            const size = (await stat(dest)).size;
            if (file.size != null && size !== file.size) {
                throw new Error(`got ${size} bytes, expected ${file.size}`);
            }
            return size;
        } catch (err) {
            if (attempt >= 4) throw err;
            await delay(1000 * attempt);
        }
    }
}

async function backupStorage() {
    const api = storageApi();
    const buckets = await (await api('/storage/v1/bucket')).json();
    await mkdir(storageDir, { recursive: true });
    await writeFile(path.join(storageDir, 'buckets.json'), JSON.stringify(buckets, null, 2));

    const index = [];
    let failures = 0;
    for (const bucket of buckets) {
        const files = await listAll(api, bucket.id);
        const stats = { public: bucket.public, listed: files.length, downloaded: 0, bytes: 0, failed: [] };
        manifest.storage.buckets[bucket.id] = stats;
        console.log(`  ${bucket.id} (${bucket.public ? 'public' : 'private'}): ${files.length} files`);

        let next = 0;
        const worker = async () => {
            while (next < files.length) {
                const file = files[next++];
                const local = [bucket.id, ...file.name.split('/').map(safeSegment)].join('/');
                try {
                    const size = await download(api, bucket.id, file, path.join(storageDir, ...local.split('/')));
                    stats.downloaded++;
                    stats.bytes += size;
                    index.push({ bucket: bucket.id, name: file.name, path: local, size, mimetype: file.mimetype, updatedAt: file.updatedAt });
                    if (stats.downloaded % 100 === 0) console.log(`    ${stats.downloaded}/${files.length}`);
                } catch (err) {
                    stats.failed.push({ name: file.name, error: err.message });
                }
            }
        };
        await Promise.all(Array.from({ length: 6 }, worker));
        failures += stats.failed.length;
        console.log(`    ${stats.downloaded}/${files.length} downloaded, ${formatBytes(stats.bytes)}`);
    }

    index.sort((a, b) => a.path.localeCompare(b.path));
    await writeFile(path.join(storageDir, 'index.json'), JSON.stringify(index, null, 2));
    if (failures) throw new Error(`${failures} file(s) failed to download; manifest.json lists them`);
}

// ── Project settings ─────────────────────────────────────────────────────────

async function backupConfig() {
    if (!cfg.accessToken) {
        manifest.config.note = 'No SUPABASE_ACCESS_TOKEN: dashboard settings were not exported.';
        return 'skipped';
    }
    if (!projectRef) throw new Error('could not work out the project ref from SUPABASE_URL or SUPABASE_DB_URL');

    const base = process.env.SUPABASE_MANAGEMENT_API ?? 'https://api.supabase.com';
    const endpoints = {
        'project.json': '',
        'auth.json': '/config/auth',
        'storage.json': '/config/storage',
        'postgrest.json': '/postgrest',
        'postgres.json': '/config/database/postgres',
        'edge-functions.json': '/functions',
    };
    await mkdir(configDir, { recursive: true });
    const exported = [];
    const unavailable = [];
    for (const [file, suffix] of Object.entries(endpoints)) {
        const res = await fetch(`${base}/v1/projects/${projectRef}${suffix}`, {
            headers: { Authorization: `Bearer ${cfg.accessToken}` },
        });
        if (res.status === 401 || res.status === 403) {
            throw new Error(`the access token was rejected (HTTP ${res.status})`);
        }
        if (!res.ok) {
            unavailable.push(`${file} (HTTP ${res.status})`);
            continue;
        }
        await writeFile(path.join(configDir, file), JSON.stringify(await res.json(), null, 2));
        exported.push(file);
    }
    Object.assign(manifest.config, { exported, unavailable });
    console.log(`  exported ${exported.join(', ')}`);
    if (unavailable.length) console.warn(`  ! not available: ${unavailable.join(', ')}`);
    if (!exported.length) throw new Error('nothing could be exported');
}

// ── Integrity ────────────────────────────────────────────────────────────────

async function writeChecksums() {
    const entries = await readdir(outDir, { recursive: true, withFileTypes: true });
    const files = entries
        .filter((e) => e.isFile())
        .map((e) => path.relative(outDir, path.join(e.parentPath, e.name)).split(path.sep).join('/'))
        .filter((f) => f !== 'SHA256SUMS.txt')
        .sort();
    const lines = [];
    for (const f of files) {
        const hash = createHash('sha256');
        await pipeline(createReadStream(path.join(outDir, f)), hash);
        lines.push(`${hash.digest('hex')}  ${f}`);
    }
    await writeFile(path.join(outDir, 'SHA256SUMS.txt'), `${lines.join('\n')}\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log(`Backing up${projectRef ? ` project ${projectRef}` : ''} to ${outDir}`);
await mkdir(outDir, { recursive: true });

if (!skip('db')) {
    await step('Check Docker', ensureDocker);
    if (manifest.steps['Check Docker'] === 'ok') {
        await step('Database: count rows', async () => {
            manifest.database.before = await inspectDatabase();
            const { serverVersion, rows } = manifest.database.before;
            console.log(`  Postgres ${serverVersion.split(' ')[0]}, ${Object.keys(rows).length} tables`);
        });
        await step('Database: full dump (all schemas)', dumpFull);
        if (!skip('supabase-cli')) await step('Database: Supabase-format dump', dumpSupabaseFormat);
        // Counting again brackets the dump, so verify.mjs can tell rows written
        // during the backup apart from rows that went missing.
        await step('Database: count rows again', async () => {
            manifest.database.after = await inspectDatabase();
        });
    }
}
if (!skip('storage')) await step('Storage: download every bucket', backupStorage);
if (!skip('config')) await step('Project settings', backupConfig);

await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
await step('Checksums', writeChecksums);

// ── Summary ──────────────────────────────────────────────────────────────────

const failed = Object.entries(manifest.steps).filter(([, s]) => s.startsWith('failed'));
console.log(`\n${'─'.repeat(72)}`);
console.log(failed.length ? `Backup INCOMPLETE: ${failed.length} step(s) failed.` : 'Backup complete.');
console.log(`Location: ${outDir}`);

const rows = manifest.database.before?.rows ?? {};
const count = (t) => (typeof rows[t] === 'number' ? rows[t] : '?');
if (manifest.database.before) {
    const publicTables = Object.keys(rows).filter((t) => t.startsWith('public.')).length;
    console.log(
        `  database  ${publicTables} app tables · ${count('public.orders')} orders · ${count('public.customers')} customers · ${count('auth.users')} login accounts`,
    );
}
for (const [id, b] of Object.entries(manifest.storage.buckets)) {
    console.log(`  storage   ${id}: ${b.downloaded}/${b.listed} files, ${formatBytes(b.bytes)}`);
}
if (manifest.config.exported) console.log(`  settings  ${manifest.config.exported.length} files`);

console.log(`
Not in Supabase, so record them yourself:
  • Google Cloud Console: the OAuth client used for "Sign in with Google"
  • Vercel: environment variables for both projects (Razorpay, Resend, WhatsApp, Meta…)${
      manifest.config.note
          ? `
  • Supabase dashboard settings (set SUPABASE_ACCESS_TOKEN to export these automatically)`
          : ''
  }

This folder holds customer data, password hashes and vendor documents.
Encrypt it before copying it anywhere else.

Next: node scripts/backup/verify.mjs "${outDir}"`);

process.exit(failed.length ? 1 : 0);
