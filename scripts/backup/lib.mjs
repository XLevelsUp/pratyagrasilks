// Shared helpers for backup.mjs and verify.mjs.
//
// Nothing here needs installing on the host beyond Node and Docker: every
// Postgres client tool runs inside the official postgres image.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(HERE, '..', '..');
export const ENV_FILE = path.join(HERE, '.env.backup.local');

// Client tools must be at least the server's major version. 17 covers both the
// 15 and 17 servers Supabase runs, and its pg_restore reads either's dumps.
export const PG_IMAGE = 'postgres:17';

export function loadConfig() {
    if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
    const e = process.env;
    const cfg = {
        dbUrl: e.SUPABASE_DB_URL?.trim() || undefined,
        supabaseUrl: e.SUPABASE_URL?.trim().replace(/\/+$/, '') || undefined,
        serviceKey: e.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined,
        accessToken: e.SUPABASE_ACCESS_TOKEN?.trim() || undefined,
        // Outside the repo by default so customer data can never be committed.
        backupRoot: path.resolve(REPO_ROOT, e.BACKUP_ROOT?.trim() || '../pratyagrasilks-backups'),
    };
    if (cfg.dbUrl) {
        try {
            const pw = new URL(cfg.dbUrl).password;
            addSecret(pw);
            addSecret(decodeURIComponent(pw));
        } catch {
            // Malformed URL — backup.mjs reports it.
        }
    }
    addSecret(cfg.serviceKey);
    addSecret(cfg.accessToken);
    return cfg;
}

// ── Redaction ────────────────────────────────────────────────────────────────
// Tool output can echo connection details; scrub every known secret from
// anything we print or keep.

const secrets = new Set();

function addSecret(s) {
    if (s && s.length >= 4) secrets.add(s);
}

export function redact(text) {
    let out = String(text);
    for (const s of secrets) out = out.split(s).join('***');
    return out;
}

// ── Processes ────────────────────────────────────────────────────────────────

/**
 * Spawn a process and collect its output. `tee` also streams it to the
 * console (redacted), for long steps whose progress the user should see.
 */
export function run(cmd, args, { env, cwd, shell = false, tee = false } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            cwd,
            shell,
            windowsHide: true,
            env: env ? { ...process.env, ...env } : process.env,
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => {
            stdout += d;
            if (tee) process.stdout.write(redact(d));
        });
        child.stderr.on('data', (d) => {
            stderr += d;
            if (tee) process.stderr.write(redact(d));
        });
        child.on('error', reject);
        child.on('close', (code) =>
            resolve({ code, stdout: redact(stdout), stderr: redact(stderr) }),
        );
    });
}

export function docker(args, opts) {
    return run('docker', args, opts);
}

/**
 * Run a postgres client tool (pg_dump, psql, …) in a throwaway container
 * against `dbUrl`. The URL travels as an environment variable rather than an
 * argument, so the password never appears on a command line.
 */
export function pgRemote(tool, args, { dbUrl, mount, tee } = {}) {
    const dockerArgs = ['run', '--rm', '-e', 'DB_URL'];
    if (mount) dockerArgs.push('--mount', `type=bind,source=${mount},target=/work`);
    dockerArgs.push(PG_IMAGE, 'sh', '-c', `exec ${tool} --dbname="$DB_URL" "$@"`, 'sh', ...args);
    return docker(dockerArgs, { env: { DB_URL: dbUrl }, tee });
}

export async function ensureDocker() {
    const info = await docker(['info', '--format', '{{.ServerVersion}}']).catch(() => null);
    if (!info || info.code !== 0) {
        throw new Error('Docker is not running. Start Docker Desktop and try again.');
    }
    const image = await docker(['image', 'inspect', PG_IMAGE]);
    if (image.code !== 0) {
        console.log(`  pulling ${PG_IMAGE} (first run only)…`);
        const pull = await docker(['pull', PG_IMAGE], { tee: true });
        if (pull.code !== 0) throw new Error(`docker pull ${PG_IMAGE} failed`);
    }
}

export function lastLines(text, n = 8) {
    return text.trim().split(/\r?\n/).slice(-n).join('\n');
}

// ── Database inspection ──────────────────────────────────────────────────────
// One read-only DO block that reports, via NOTICEs, everything needed to prove
// a restore is complete: exact row counts for every table in the schemas this
// app uses, files per bucket, and counts of the server-side logic (functions,
// triggers, policies, views) plus sequence positions such as invoice_seq.
// Each count is isolated so one unreadable table cannot abort the rest.
// row_security is off so that a login subject to RLS gets an error rather
// than a silently filtered, too-low count.

export const INSPECT_SQL = `
DO $inspect$
DECLARE r record; n bigint;
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RAISE NOTICE 'VERSION|%', current_setting('server_version');
  FOR r IN SELECT table_schema AS s, table_name AS t
             FROM information_schema.tables
            WHERE table_type = 'BASE TABLE' AND table_schema IN ('public', 'auth', 'storage')
            ORDER BY 1, 2 LOOP
    BEGIN
      EXECUTE format('SELECT count(*) FROM %I.%I', r.s, r.t) INTO n;
      RAISE NOTICE 'ROWS|%.%|%', r.s, r.t, n;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'ROWS|%.%|!%', r.s, r.t, SQLERRM;
    END;
  END LOOP;
  BEGIN
    FOR r IN SELECT bucket_id AS b, count(*) AS c FROM storage.objects GROUP BY 1 ORDER BY 1 LOOP
      RAISE NOTICE 'OBJECTS|%|%', r.b, r.c;
    END LOOP;
  EXCEPTION WHEN others THEN NULL;
  END;
  RAISE NOTICE 'OBJ|functions in public|%', (SELECT count(*) FROM pg_proc p
      JOIN pg_namespace ns ON ns.oid = p.pronamespace WHERE ns.nspname = 'public');
  RAISE NOTICE 'OBJ|views in public|%', (SELECT count(*) FROM pg_views WHERE schemaname = 'public');
  RAISE NOTICE 'OBJ|RLS policies in public + storage|%', (SELECT count(*) FROM pg_policies
      WHERE schemaname IN ('public', 'storage'));
  RAISE NOTICE 'OBJ|triggers on public + auth + storage tables|%', (SELECT count(*) FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace ns ON ns.oid = c.relnamespace
      WHERE NOT t.tgisinternal AND ns.nspname IN ('public', 'auth', 'storage'));
  FOR r IN SELECT schemaname || '.' || sequencename AS s, last_value AS v
             FROM pg_sequences WHERE schemaname = 'public' ORDER BY 1 LOOP
    RAISE NOTICE 'SEQ|%|%', r.s, coalesce(r.v::text, 'unset');
  END LOOP;
END
$inspect$;`;

export function parseInspect(output) {
    const out = { serverVersion: null, rows: {}, objectsByBucket: {}, schemaObjects: {}, sequences: {} };
    for (const line of output.split(/\r?\n/)) {
        const m = line.match(/NOTICE:\s+(VERSION|ROWS|OBJECTS|OBJ|SEQ)\|(.*)$/);
        if (!m) continue;
        const [key, value] = m[2].split(/\|(?=[^|]*$)/);
        const num = /^\d+$/.test(value) ? Number(value) : value;
        if (m[1] === 'VERSION') out.serverVersion = m[2];
        else if (m[1] === 'ROWS') out.rows[key] = typeof num === 'number' ? num : value.replace(/^!/, 'error: ');
        else if (m[1] === 'OBJECTS') out.objectsByBucket[key] = num;
        else if (m[1] === 'OBJ') out.schemaObjects[key] = num;
        else out.sequences[key] = num;
    }
    if (!out.serverVersion) throw new Error('could not read database statistics');
    return out;
}

export function formatBytes(n) {
    if (n < 1024) return `${n} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let i = -1;
    do {
        n /= 1024;
        i++;
    } while (n >= 1024 && i < units.length - 1);
    return `${n.toFixed(1)} ${units[i]}`;
}
