// ncc emits pino's thread-stream worker as CommonJS (`worker.js`) next to an
// ESM bundle (`dist/package.json` has "type": "module"), so Node treats the
// worker as ESM and crashes with "require is not defined". Rename the worker
// to `.cjs` and point the bundle's references at the new name.
// Runs automatically after every ncc build — safe to run repeatedly.
import { existsSync, readFileSync, renameSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve from this script's location so it works from any cwd (pnpm runs
// package scripts with the package dir as cwd).
const root = dirname(dirname(fileURLToPath(import.meta.url)));

const dirs = [
  join(root, "artifacts/api-server/dist"),
  join(root, "artifacts/api-server/dist-serverless"),
];

for (const dir of dirs) {
  const workerJs = join(dir, "worker.js");
  const workerCjs = join(dir, "worker.cjs");
  if (!existsSync(join(dir, "index.js"))) continue; // bundle not built yet

  if (existsSync(workerJs)) {
    renameSync(workerJs, workerCjs);
  }
  if (!existsSync(workerCjs)) continue; // no pino worker in this bundle

  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".js")) continue;
    const p = join(dir, file);
    const code = readFileSync(p, "utf8");
    if (code.includes('"worker.js"')) {
      writeFileSync(p, code.split('"worker.js"').join('"worker.cjs"'));
    }
  }
  console.log(`[fix-ncc-worker] ${dir}: worker -> worker.cjs`);
}
