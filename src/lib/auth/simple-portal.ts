/**
 * Simple portal password auth for production when Postgres/PGLite is unavailable.
 * Cookie is HMAC-signed with BETTER_AUTH_SECRET (or a process secret).
 * Does not replace Better Auth — works alongside it.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import { PORTAL_USER } from "./portal-identity";

export { PORTAL_USER };

export const PORTAL_COOKIE = "mg_portal_session";

/**
 * Portal password. Production fail-closed: no hardcoded default.
 * Local/dev only: `fitboard-dev-only` when PORTAL_PASSWORD is unset.
 */
export function portalPassword(): string | null {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.PORTAL_PASSWORD?.trim()
      : undefined;
  if (fromEnv && fromEnv.length >= 8) return fromEnv;
  const prod =
    typeof process !== "undefined" && process.env.NODE_ENV === "production";
  if (prod) return null;
  return "fitboard-dev-only";
}

function signingSecret(): string {
  const s =
    (typeof process !== "undefined" && process.env.BETTER_AUTH_SECRET?.trim()) ||
    (typeof process !== "undefined" && process.env.PORTAL_AUTH_SECRET?.trim()) ||
    "mg-portal-dev-secret-change-me";
  return s;
}

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64").toString("utf8");
}

export type PortalSessionPayload = {
  id: string;
  email: string;
  name: string;
  exp: number;
};

export function createPortalToken(ttlSeconds = 60 * 60 * 24 * 30): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = b64url(
    JSON.stringify({
      id: PORTAL_USER.id,
      email: PORTAL_USER.email,
      name: PORTAL_USER.name,
      exp,
    } satisfies PortalSessionPayload),
  );
  const sig = b64url(
    createHmac("sha256", signingSecret()).update(body).digest(),
  );
  return `${body}.${sig}`;
}

export function verifyPortalToken(token: string | undefined | null): PortalSessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = b64url(
    createHmac("sha256", signingSecret()).update(body).digest(),
  );
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(b64urlDecode(body)) as PortalSessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.id !== PORTAL_USER.id) return null;
    return payload;
  } catch {
    return null;
  }
}

export function checkPortalPassword(password: string): boolean {
  const expected = portalPassword();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
