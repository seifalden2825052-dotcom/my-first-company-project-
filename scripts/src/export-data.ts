import { mkdir, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import { db, pool, certificatesTable, sitePagesTable } from "@workspace/db";

const outputPath = resolve(
  process.env.DATA_TRANSFER_FILE || "./data/tqp-data-export.json",
);

try {
  const [certificates, pages] = await Promise.all([
    db.select().from(certificatesTable),
    db.select().from(sitePagesTable),
  ]);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    JSON.stringify(
      {
        format: "tqp-data-export-v1",
        exportedAt: new Date().toISOString(),
        certificates,
        pages,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `Exported ${certificates.length} certificates and ${pages.length} pages to ${outputPath}`,
  );
} finally {
  await pool.end();
}