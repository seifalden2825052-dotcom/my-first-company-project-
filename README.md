# Top Quality Prospect

Source code for the Top Quality Prospect website and its API.

## Local development

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/top-quality-prospect run dev
```

## Build

```bash
pnpm build
```

## Deployment and secrets

Copy `.env.example` into the environment-variable settings of your host and
provide real values there. Do not commit `.env` files or secret values.

See [HOSTING.md](HOSTING.md) for the Hostinger/Vercel notes, PostgreSQL setup,
and the current media-storage portability requirement.