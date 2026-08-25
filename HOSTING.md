# Hosting and environment variables

The application has no runtime dependency on Replit. It runs on any standard
Node.js host with PostgreSQL — Hostinger, a VPS, or Vercel (serverless).

## How deployment works (important)

**Hosts never build this project.** Hostinger's build environment mounts every
writable directory (`repository`, `$HOME`, `/tmp`) as `noexec`, so esbuild —
which Vite requires — can never run there. Instead:

1. The compiled output is **committed to the repository**:
   - `artifacts/api-server/dist/` — the Node.js server bundle (self-contained,
     no `node_modules` needed at runtime)
   - `artifacts/api-server/dist-serverless/` — the Vercel serverless bundle
   - `artifacts/top-quality-prospect/dist/public/` — the compiled website
2. `npm run build` runs `scripts/build-if-needed.mjs`, which **skips building**
   when the committed output exists (Hostinger case) and only builds on machines
   that can (Replit, your PC, CI).
3. A GitHub Action (`.github/workflows/build-dist.yml`) rebuilds and commits the
   `dist` folders automatically on every source push to `main`, so the deployable
   output is always up to date without any manual build step.

## Hostinger (recommended primary host)

1. Connect the GitHub repo, branch `main`, Node.js **20.19+**.
2. Build command: `npm run build` (it will print "Using the committed prebuilt
   output" and finish instantly — this is expected).
3. Start command: `npm start` (runs `node artifacts/api-server/dist/index.js`).
4. Set the environment variables below, then redeploy.

The API serves the compiled website from the same Node.js process, so the
public site, admin panel, certificate verification, QR codes, Pages editor, and
media all live on one domain.

## Vercel

The repo includes `vercel.json` and `api/index.js`; Vercel deploys the whole
app as one serverless function using the committed prebuilt bundles.

- Framework preset: **Other**. No build/override settings needed.
- Set `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`,
  `NODE_ENV=production` in the Vercel project settings.
- **Media caveat:** Vercel's filesystem is ephemeral, so admin uploads stored
  on local disk disappear between invocations. For production media on Vercel,
  point the storage layer at external object storage, or keep media-heavy usage
  on Hostinger.

## Required environment variables

- `DATABASE_URL`: any reachable PostgreSQL database
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: the admin login
- `SESSION_SECRET`: a long random value (32+ characters)
- `NODE_ENV=production`
- `PORT`: supplied by the host when applicable (Hostinger sets it)
- `MEDIA_STORAGE_DIR`: writable, persistent directory for uploads on Node
  hosts, e.g. `/home/USERNAME/tqp-media` (back it up with the database)

## Moving the existing database

Before shutting down the Replit version, run against its current database:

```bash
corepack pnpm data:export
```

It creates `data/tqp-data-export.json` (ignored by Git). Copy that file to the
new host, configure its `DATABASE_URL`, run `corepack pnpm db:push`, then:

```bash
corepack pnpm data:import
```

This transfers certificates and dynamic Pages. Copy any existing uploaded media
files separately into `MEDIA_STORAGE_DIR` before switching the domain.
