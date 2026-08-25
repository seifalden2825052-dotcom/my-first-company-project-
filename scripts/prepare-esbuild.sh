#!/usr/bin/env bash
set -euo pipefail

# Hostinger's hbuilds source directory can be mounted non-executable. Copy
# esbuild outside that release directory and point all build tools at the copy.
if [ ! -d node_modules/.pnpm ]; then
  echo "node_modules/.pnpm is missing" >&2
  exit 1
fi

source_binary="$(find node_modules/.pnpm -path '*/esbuild/bin/esbuild' -print -quit 2>/dev/null || true)"
if [ -z "$source_binary" ]; then
  echo "Could not locate esbuild/bin/esbuild" >&2
  exit 1
fi

# Hostinger may mount the release directory and the user's cache directory
# with noexec. Try /tmp first because it is normally an executable mount.
candidate_dirs=(
  "${TMPDIR:-/tmp}/top-quality-prospect-esbuild"
  "${HOME:-/tmp}/.cache/top-quality-prospect/bin"
)

for binary_dir in "${candidate_dirs[@]}"; do
  mkdir -p "$binary_dir"
  binary_path="$binary_dir/esbuild"
  rm -f "$binary_path"
  cp "$source_binary" "$binary_path"
  chmod 755 "$binary_path"

  if [ -x "$binary_path" ] && "$binary_path" --version >/dev/null 2>&1; then
    printf '%s\n' "$binary_path"
    exit 0
  fi
done

echo "Could not execute relocated esbuild from /tmp or HOME." >&2
echo "Hostinger is mounting both locations with noexec; use a build environment with executable temporary storage." >&2
exit 1