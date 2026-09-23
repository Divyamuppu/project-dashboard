import { cookies } from "next/headers";

/**
 * Admin unlock.
 *
 * The dashboard is open to anyone with the link, read-only. Entering the admin
 * password from the header unlocks editing for that browser.
 *
 * A successful unlock sets an HMAC-signed, HttpOnly cookie. The signature is
 * verified on every request, so the cookie cannot be forged or edited in the
 * browser to grant admin.
 *
 * Signing uses Web Crypto so the same code runs in Node and on the Edge.
 */

export const SESSION_COOKIE = "atom_admin";
const SESSION_DAYS = 30;

function secretKeyMaterial(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short (need 16+ chars). Generate with: openssl rand -hex 32"
    );
  }
  return s;
}

/** Base64url without padding — safe in a cookie value. */
function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKeyMaterial()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(sig);
}

/** Constant-time compare — never `===` on a secret or a signature. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Signed cookie value: `admin.expiryMs.signature` */
export async function createSessionValue(): Promise<string> {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

/** True only for a correctly signed, unexpired admin cookie. */
export async function readSessionValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [role, expiresRaw, signature] = parts as [string, string, string];
  if (role !== "admin") return false;

  const expected = await sign(`${role}.${expiresRaw}`);
  if (!timingSafeEqual(signature, expected)) return false;

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  return true;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

/** Checks a submitted password against ADMIN_PASSWORD. */
export function isAdminPassword(password: string): boolean {
  const admin = process.env.ADMIN_PASSWORD ?? "";
  if (admin.length === 0) return false;
  return timingSafeEqual(password, admin);
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET.length >= 16 &&
      process.env.ADMIN_PASSWORD
  );
}

// ── Reading the session in Server Components and Server Actions ───────────

/** Is this request from an unlocked admin? */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return readSessionValue(store.get(SESSION_COOKIE)?.value);
}

/**
 * Server-side gate for every mutating action.
 *
 * The UI hides admin controls from visitors, but that is cosmetic — anyone can
 * invoke a Server Action directly. This is the check that actually stops them,
 * so every write path must call it.
 */
export async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (await isAdmin()) return { ok: true };
  return { ok: false, error: "Admin access required. Unlock from the top right." };
}
