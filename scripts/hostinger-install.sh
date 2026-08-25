#!/usr/bin/env bash
set -euo pipefail

# Some Hostinger build directories restore pnpm files without the executable
# bit. Installing with scripts disabled lets us repair that bit before
# esbuild's postinstall tries to execute its native binary.
corepack pnpm install --frozen-lockfile --ignore-scripts

if [ -d node_modules/.pnpm ]; then
  find node_modules/.pnpm -type f -path '*/esbuild/bin/esbuild' -exec chmod u+x {} +
fi

# esbuild is relocated and verified by scripts/build-hostinger.sh during the
# build, because Hostinger's release directory may be mounted noexec.