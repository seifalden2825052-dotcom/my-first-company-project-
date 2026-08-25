import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_AUTH_COOKIE = "tqp_admin_auth";
const TOKEN_TTL_SECONDS = 24 * 60 * 60;

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to a strong value (>= 32 chars) in production",
    );
  }
  return secret ?? "tqp-dev-only-session-secret";
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function signature(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createAdminToken(username: string): string {
  const payload = encode(
    JSON.stringify({ username, expiresAt: Date.now() + TOKEN_TTL_SECONDS * 1000 }),
  );
  return `${payload}.${signature(payload)}`;
}

export function getAdminUsernameFromToken(token: unknown): string | null {
  if (typeof token !== "string") return null;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = token.slice(0, separator);
  const providedSignature = token.slice(separator + 1);
  const expectedSignature = signature(payload);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { username?: unknown; expiresAt?: unknown };
    if (
      typeof decoded.username !== "string" ||
      typeof decoded.expiresAt !== "number" ||
      decoded.expiresAt <= Date.now()
    ) {
      return null;
    }
    return decoded.username;
  } catch {
    return null;
  }
}