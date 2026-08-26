import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, certificatesTable } from "@workspace/db";
import {
  VerifyCertificateParams,
  GetCertificateParams,
  DeleteCertificateParams,
  UpdateCertificateParams,
  CreateCertificateBody,
  UpdateCertificateBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * Resolve the browser-facing origin behind Replit/Vercel/Hostinger proxies.
 * QR image URLs stay relative so the browser keeps the admin cookie, while
 * the URL encoded inside the QR uses the public forwarded origin.
 */
function forwardedOrigin(req: { protocol: string; get(name: string): string | undefined }): string {
  const configuredOrigin = process.env.PUBLIC_APP_ORIGIN?.trim().replace(/\/+$/, "");
  if (configuredOrigin) return configuredOrigin;

  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.get("host");
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${host}`;
}

function qrEndpointPath(certificateNumber: string): string {
  return `/api/certificates/qr/${encodeURIComponent(certificateNumber)}`;
}

/** Compute real status from expiration date (revoked stays revoked) */
function computeStatus(cert: { expirationDate: string; status: string }): string {
  if (cert.status === "revoked") return "revoked";
  const now = new Date();
  const expDate = new Date(cert.expirationDate);
  // Treat the expiration date as inclusive through the end of that day
  expDate.setHours(23, 59, 59, 999);
  return expDate < now ? "expired" : "valid";
}

// Public: verify a certificate by its code
router.get("/certificates/verify/:code", async (req, res): Promise<void> => {
  const params = VerifyCertificateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cert] = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.certificateNumber, params.data.code));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  // QR code URL only exposed to authenticated admins
  const isAdminSession = !!(req.session as any)?.adminAuthenticated;
  const qrCodeUrl = isAdminSession
    ? qrEndpointPath(cert.certificateNumber)
    : null;

  res.json({ ...cert, status: computeStatus(cert), qrCodeUrl });
});

// Public: get QR code image for a certificate
router.get("/certificates/qr/:code", async (req, res): Promise<void> => {
  // QR images are admin-only; the URL they encode remains publicly accessible
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;

  const [cert] = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.certificateNumber, code));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  try {
    const QRCode = await import("qrcode");
    // The QR code encodes the public verification URL (respect the proxy's forwarded origin)
    const origin = forwardedOrigin(req);
    const verifyUrl = `${origin}/certificates?verify=${encodeURIComponent(cert.certificateNumber)}`;
    const qrBuffer = await QRCode.toBuffer(verifyUrl, { type: "png", width: 300, margin: 2 });
    res.setHeader("Content-Type", "image/png");
    res.send(qrBuffer);
  } catch (err) {
    req.log.error({ err }, "Failed to generate QR code");
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Public: certificate stats (computed from real expiration dates)
router.get("/certificates/stats", async (_req, res): Promise<void> => {
  const certs = await db.select().from(certificatesTable);

  const stats = { total: 0, valid: 0, expired: 0, revoked: 0 };
  for (const cert of certs) {
    stats.total += 1;
    const s = computeStatus(cert);
    if (s === "valid") stats.valid += 1;
    else if (s === "expired") stats.expired += 1;
    else if (s === "revoked") stats.revoked += 1;
  }

  res.json(stats);
});

// Admin: list all certificates
router.get("/certificates", async (req, res): Promise<void> => {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const certs = await db
    .select()
    .from(certificatesTable)
    .orderBy(certificatesTable.createdAt);

  const certsWithQr = certs.map((c) => ({
    ...c,
    status: computeStatus(c),
    qrCodeUrl: qrEndpointPath(c.certificateNumber),
  }));

  res.json(certsWithQr);
});

// Admin: create certificate
router.post("/certificates", async (req, res): Promise<void> => {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status: _status, ...rest } = parsed.data as any;
  const statusVal = _status ?? "valid";

  const [cert] = await db
    .insert(certificatesTable)
    .values({ ...rest, status: statusVal })
    .returning();

  res.status(201).json({ ...cert, status: computeStatus(cert), qrCodeUrl: qrEndpointPath(cert.certificateNumber) });
});

// Admin: get certificate by ID
router.get("/certificates/:id", async (req, res): Promise<void> => {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = GetCertificateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cert] = await db
    .select()
    .from(certificatesTable)
    .where(eq(certificatesTable.id, params.data.id));

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  res.json({ ...cert, status: computeStatus(cert), qrCodeUrl: qrEndpointPath(cert.certificateNumber) });
});

// Admin: update certificate
router.put("/certificates/:id", async (req, res): Promise<void> => {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateCertificateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cert] = await db
    .update(certificatesTable)
    .set(parsed.data)
    .where(eq(certificatesTable.id, params.data.id))
    .returning();

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  res.json({ ...cert, status: computeStatus(cert), qrCodeUrl: qrEndpointPath(cert.certificateNumber) });
});

// Admin: delete certificate
router.delete("/certificates/:id", async (req, res): Promise<void> => {
  if (!(req.session as any)?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteCertificateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cert] = await db
    .delete(certificatesTable)
    .where(eq(certificatesTable.id, params.data.id))
    .returning();

  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
