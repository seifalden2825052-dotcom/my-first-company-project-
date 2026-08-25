import { readFile } from "fs/promises";
import { resolve } from "path";
import { db, pool, certificatesTable, sitePagesTable } from "@workspace/db";

type ExportFile = {
  format: "tqp-data-export-v1";
  certificates: Array<{
    certificateNumber: string;
    holderName: string;
    ndtMethod: string;
    level: string;
    issuedDate: string;
    expirationDate: string;
    status: string;
    issuedBy: string;
    notes: string | null;
  }>;
  pages: Array<{
    title: string;
    slug: string;
    published: boolean;
    blocks: unknown;
  }>;
};

const inputPath = resolve(
  process.env.DATA_TRANSFER_FILE || "./data/tqp-data-export.json",
);

try {
  const data = JSON.parse(await readFile(inputPath, "utf8")) as ExportFile;
  if (data.format !== "tqp-data-export-v1") {
    throw new Error("Unsupported data export file");
  }

  await db.transaction(async (tx) => {
    for (const certificate of data.certificates) {
      await tx
        .insert(certificatesTable)
        .values(certificate)
        .onConflictDoUpdate({
          target: certificatesTable.certificateNumber,
          set: certificate,
        });
    }

    for (const page of data.pages) {
      await tx
        .insert(sitePagesTable)
        .values(page as typeof sitePagesTable.$inferInsert)
        .onConflictDoUpdate({
          target: sitePagesTable.slug,
          set: page as typeof sitePagesTable.$inferInsert,
        });
    }
  });

  console.log(
    `Imported ${data.certificates.length} certificates and ${data.pages.length} pages from ${inputPath}`,
  );
} finally {
  await pool.end();
}