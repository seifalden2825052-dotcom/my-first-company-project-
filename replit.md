# Top Quality Prospect

Professional website for Top Quality Prospect, an NDT and industrial inspection company operating in Egypt (HQ), Saudi Arabia, and the UAE — with certificate verification, an admin panel, and admin-created dynamic pages.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/top-quality-prospect run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `ADMIN_USERNAME` / `ADMIN_PASSWORD` (defaults: `admin` / `TQP@2010`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Tailwind
- API: Express 5 (session auth via express-session)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — API source of truth; run codegen after editing
- `lib/db/src/schema/` — DB tables (`certificates`, `site_pages`)
- `artifacts/api-server/src/routes/` — health, certificates, admin, pages
- `artifacts/top-quality-prospect/src/pages/Certificates.tsx` — public verification + hidden admin panel
- `artifacts/top-quality-prospect/src/components/admin/PagesManager.tsx` — dynamic pages admin
- `artifacts/top-quality-prospect/src/pages/DynamicPage.tsx` — public renderer for admin-created pages (`/p/:slug`)

## Architecture decisions

- Certificate status is always computed from the expiration date at read time (`valid`/`expired`; `revoked` is preserved) — the stored `status` column is never trusted for display.
- QR code images (`/api/certificates/qr/:code`) are admin-only (401 otherwise); the URL a QR encodes (`/certificates?verify=CODE`) is public.
- Admin access is hidden: small "Admin" link at the bottom of `/certificates` → client-side PIN `1234` → username/password login.
- Dynamic pages: admin creates pages with custom labeled blocks (heading/text/price/image/video); published pages appear automatically in the navbar and render at `/p/:slug`.
- Media uploads: admin uploads images/videos from their device in the page editor via App Storage presigned URLs (`POST /api/storage/uploads/request-url`, admin-session gated). Blocks store the `objectPath` (`/objects/uploads/<uuid>`); `src/lib/media.ts#mediaUrl` resolves it to `/api/storage/objects/...` for display.
- Sessions: `trust proxy` enabled + `proxy: true` + secure cookies in production so admin login works when published.

## Product

- Public: home, about, NDT, training, services, certificate verification (blue VALID / red EXPIRED), three-country contact page with interactive map (Egypt HQ with arrows to Saudi Arabia and UAE).
- Admin: certificate CRUD, QR download/copy, statistics, dynamic page create/edit/publish/delete.

## User preferences

- Certificate status wording: **VALID** in blue, **EXPIRED** in red (never "ACCEPTED"/green).
- Logo should be large in navbar and footer.
- Home imagery: general NDT work, not specifically ultrasonic testing.
- Contacts: Egypt — Mohamed Refaat +20 10 00780475; Saudi Arabia — Ahmed Sedek +971-543394096; UAE — Mustafa Riad +966 50 844 6103; email info@topquality-prospect.com.
- Target custom domain: `topquality-prospect.com`.

## Gotchas

- Always update `lib/api-spec/openapi.yaml` first, then run codegen, before adding API routes or frontend hooks.
- Production DB schema is applied automatically by Replit's Publish flow (it diffs dev→prod and applies the SQL on publish). Never add custom migration scripts, deploy-time `db push` hooks, or startup DDL — after schema changes, push to dev and re-publish.
- `vite.config.ts` requires `PORT` and `BASE_PATH` env vars — deployment provides them via `artifact.toml` `[services.env]`; set them manually for ad-hoc local builds.
- Orval names request-body Zod schemas `<OperationId>Body` (e.g. `CreatePageBody`), not the OpenAPI schema name.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
