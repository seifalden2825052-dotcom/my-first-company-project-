#!/usr/bin/env node
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

// Hostinger (and any host that cannot execute native binaries such as esbuild)
// must never build. The compiled output is committed to the repository, so the
// build step becomes a no-op there. On a normal machine (Replit, CI, Vercel)
// without committed output, the real build runs.
const requiredOutputs = [
  "artifacts/api-server/dist/index.js",
  "artifacts/api-server/dist-serverless/index.js",
  "artifacts/top-quality-prospect/dist/public/index.html",
];

const missing = requiredOutputs.filter((file) => !existsSync(file));

if (missing.length === 0) {
  console.log("[build] Using the committed prebuilt output; skipping rebuild.");
  process.exit(0);
}

console.log(`[build] Missing build output (${missing.join(", ")}); building.`);
const result = spawnSync("bash", ["./scripts/build-hostinger.sh"], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
