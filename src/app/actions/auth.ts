"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  createSessionValue,
  isAdminPassword,
  isAuthConfigured,
} from "@/lib/auth";
import { CATEGORY_KEYS } from "@/lib/links";

export type LoginState = { ok?: boolean; error?: string };

/**
 * Brute-force brake. In-memory, so it resets on redeploy and is per-instance —
 * enough to make guessing a long password impractical, not a substitute for one.
 * Move to Redis or the database if this ever runs on more than one instance.
 */
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);

  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  rec.count += 1;

  if (attempts.size > 5000) {
    for (const [k, v] of attempts) if (now - v.first > WINDOW_MS) attempts.delete(k);
  }

  return rec.count > MAX_ATTEMPTS;
}

function revalidateAll() {
  revalidatePath("/");
  CATEGORY_KEYS.forEach((k) => revalidatePath(`/c/${k}`));
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return {
      error: "Admin unlock isn't configured. Set ADMIN_PASSWORD and SESSION_SECRET.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter the password." };

  // Keyed per instance rather than per IP — proxy headers are spoofable, and a
  // global brake is the honest guarantee here.
  if (rateLimited("global")) {
    return { error: "Too many attempts. Wait 15 minutes and try again." };
  }

  if (!isAdminPassword(password)) return { error: "That password isn't right." };

  attempts.delete("global");

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), SESSION_COOKIE_OPTIONS);

  revalidateAll();
  return { ok: true };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  revalidateAll();
}
