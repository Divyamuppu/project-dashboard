import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Server-to-server client for webhook routes. No cookies, no user session.
 *
 * Uses the service-role key when one is set, falling back to the anon key.
 * Right now RLS is open (0002_disable_auth.sql) so anon can write; if sign-in
 * is ever restored via 0003, SUPABASE_SERVICE_ROLE_KEY becomes required for
 * the intake route to keep working.
 *
 * The service-role key bypasses RLS entirely — it must never be exposed to the
 * browser, so it is deliberately not prefixed NEXT_PUBLIC_.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
