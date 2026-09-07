# PratyagraSilks — Luxury Silk Saree E-commerce

A Turborepo monorepo holding two Next.js 14 applications: the public storefront
and the internal admin portal, deployed independently to separate domains.

| App | Package | Domain | Dev port |
| --- | --- | --- | --- |
| Storefront | `@pratyagra/marketing` | pratyagrasilks.com | 3200 |
| Admin portal | `@pratyagra/admin` | admin.pratyagrasilks.com | 3210 |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Monorepo:** Turborepo + pnpm workspaces
- **Styling:** Tailwind CSS
- **Database / Auth:** Supabase
- **Hosting:** Vercel (two projects, one repository)
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- pnpm 9.15.4 — `corepack enable && corepack prepare pnpm@9.15.4 --activate`,
  or `npm install -g pnpm@9.15.4` if corepack cannot write its shims

On Windows, enable long paths before the first install — pnpm's virtual store
is deep and nested app paths overflow the legacy limit:

```bash
git config core.longpaths true
# and, once, in an elevated PowerShell:
# Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' LongPathsEnabled 1
```

### Installation

```bash
pnpm install

# each app reads its own .env.local
cp apps/marketing/.env.example apps/marketing/.env.local
cp apps/admin/.env.example     apps/admin/.env.local
```

### Running

```bash
pnpm dev              # both apps
pnpm dev:marketing    # storefront only  -> http://localhost:3200
pnpm dev:admin        # admin only       -> http://localhost:3210

pnpm build            # build everything
pnpm lint
pnpm typecheck
pnpm test
```

> Stop dev servers before running a build. `next dev` and `next build` write
> the same `.next` directory, and on Windows the dev server's file locks make a
> concurrent build fail with `EPERM: rename` — or half-succeed and leave a
> manifest that 500s every route on the next dev run.

## Project Structure

```
pratyagrasilks/
├── apps/
│   ├── marketing/          # storefront: catalog, cart, checkout, blog, account
│   └── admin/              # back office: POS, products, vendors, CRM, analytics
├── packages/
│   ├── core/               # framework-free: types, roles, pricing/campaign
│   │                       #   utils, zod schemas, blog row mappers
│   ├── ui/                 # client components shared by both apps
│   ├── auth/               # Supabase clients, AuthContext, role guards,
│   │                       #   shared edge-middleware client
│   └── config/             # Tailwind preset, tsconfig bases, ESLint config
├── supabase/               # SQL schema and migrations
├── scripts/                # one-off SQL and SEO verification scripts
└── turbo.json
```

### Conventions worth knowing

- **`@/*` is app-local.** Each app's tsconfig maps it to that app's own root.
  Anything shared crosses via a `@pratyagra/*` package specifier.
- **Packages ship raw TS/TSX**, compiled by each app's SWC through
  `transpilePackages`. There is no build step, so `'use client'` directives
  survive verbatim.
- **No `'use server'` file may live in `packages/*`.** Next derives Server
  Action IDs from resolved module paths, which differ between build and
  runtime under pnpm's isolated store.
- **`react`, `react-dom` and `next` are peer dependencies in packages**, never
  direct ones. A second copy of React breaks context identity; a second copy of
  Next makes `cookies()` return an empty store.
- **Each app's Tailwind config globs `../../packages/ui/src`** by real relative
  path. pnpm symlinks workspace packages and Tailwind's glob does not follow
  symlinks, so `node_modules/@pratyagra/ui` would silently render the shared
  components unstyled.
- **`turbo.json`'s build `env` list must stay exhaustive.** Turbo runs in
  strict env mode; an unlisted `NEXT_PUBLIC_*` is `undefined` at build and gets
  inlined as `undefined` into the client bundle with no error.

## Authentication

The two apps do **not** share a cookie domain. Staff sign in separately at
`admin.pratyagrasilks.com/login`; a customer session on the storefront grants
nothing on the admin host.

Admin access is enforced in `apps/admin/middleware.ts` at the edge — an
unauthenticated request is redirected to `/login` (or gets 401 JSON on
`/api/*`), and a signed-in account without an admin-level role is rejected
before any admin JavaScript is served. `useAdmin` remains for the finer
CASHIER/MARKETING per-route scoping.

`/api/cron/*` is exempt from that gate because Vercel cron authenticates with a
bearer token rather than a session cookie; the route performs its own
`CRON_SECRET` check and fails closed if the secret is unset.

## Deployment

Two Vercel projects from this one repository.

Install and build commands live in each app's `vercel.json`, which takes
precedence over the dashboard. That is deliberate: a project carried over from
the pre-monorepo setup still had `npm install` pinned as its Install Command,
and npm cannot parse the `workspace:*` protocol, so every build failed with
`EUNSUPPORTEDPROTOCOL`. Keeping the commands in the repo makes them reviewable
and immune to stale dashboard overrides.

These must still be set in the dashboard — there is no `vercel.json` equivalent,
and **Root Directory has to be set first or `apps/<app>/vercel.json` is never
read**:

| Setting | `pratyagra-marketing` | `pratyagra-admin` |
| --- | --- | --- |
| Root Directory | `apps/marketing` | `apps/admin` |
| Include files outside Root Directory | on | on |
| Node.js | 22.x | 22.x |
| Ignored Build Step | `npx turbo-ignore @pratyagra/marketing --fallback=HEAD^` | `npx turbo-ignore @pratyagra/admin --fallback=HEAD^` |
| Domains | pratyagrasilks.com, www | admin.pratyagrasilks.com |

Leave Install Command and Build Command **empty** in the dashboard so the
`vercel.json` values apply. Crons come from `apps/admin/vercel.json`.

"Include files outside Root Directory" is required so each build can see
`packages/*` and the root lockfile. `--fallback=HEAD^` matters on the first run
after enabling `turbo-ignore`, which otherwise has no prior deployment to diff
against and skips the build.

`pnpm install --frozen-lockfile` needs no `cd ../..`: run from a workspace
member, pnpm walks up to `pnpm-workspace.yaml` and installs the whole
workspace. The build command does need it, so turbo resolves `turbo.json` at
the root; output still lands in `apps/<app>/.next`, which is Vercel's default
output directory relative to the Root Directory.

Environment variables are per-project; see each app's `.env.example`. Note that
`SUPABASE_SERVICE_ROLE_KEY` is needed by **both** — the storefront uses it for
checkout, orders and the contact form.

Supabase → Authentication → URL Configuration must list
`https://admin.pratyagrasilks.com/auth/callback` and
`http://localhost:3210/auth/callback`, or staff Google sign-in fails with
"redirect_to is not allowed".

## Brand

Primary purple `#550c72`, amber accent `#D97706`, on a warm parchment
`#fbf6f0`. Playfair Display for display type, Inter for body. All of it lives
in `packages/config/tailwind-preset.js`.

## License

© 2025 PratyagraSilks. All rights reserved.
