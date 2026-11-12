import { NextResponse } from "next/server";
import { query, isDatabaseConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Connection diagnostics, readable in a browser.
 *
 * Reports what the server can actually see and do: whether DATABASE_URL is
 * present, which host it points at, whether a query succeeds, whether the
 * schema is loaded, and how many rows exist. When something fails it returns
 * the database's own error text rather than a generic message.
 *
 * TEMPORARY. Delete this file once the deployment is healthy — it discloses
 * the database host and role name, which are not secrets on their own but
 * are no use to a visitor either.
 *
 * The connection string's password is never returned. Every outgoing string
 * passes through scrub(), which removes the credentials portion of any URL
 * it finds, so a driver error that quotes the DSN cannot leak it.
 */

/** Removes `user:password@` from any URL-looking substring. */
export function scrub(text: string): string {
  return text
    // postgres://user:pass@host → postgres://***@host
    .replace(/([a-z+]+:\/\/)[^@\s/]*@/gi, "$1***@")
    // bare npg_... style tokens, in case a driver prints one on its own
    .replace(/\bnpg_[A-Za-z0-9]{8,}\b/g, "npg_***");
}

type Report = {
  ok: boolean;
  checks: Record<string, unknown>;
  hint?: string;
};

export async function GET() {
  const checks: Record<string, unknown> = {};

  // ── 1. Is the variable present at all? ───────────────────────────────────
  const raw = process.env.DATABASE_URL;
  checks.database_url_present = Boolean(raw);

  if (!raw) {
    return NextResponse.json<Report>(
      {
        ok: false,
        checks,
        hint: "DATABASE_URL is not set on this deployment. Add it in Settings → Environment Variables with Production ticked, then redeploy.",
      },
      { status: 503 }
    );
  }

  // ── 2. Does it parse, and what does it point at? ─────────────────────────
  checks.length = raw.length;
  checks.has_surrounding_quotes = /^["']|["']$/.test(raw);
  checks.has_whitespace = raw !== raw.trim();
  checks.has_newline = /[\r\n]/.test(raw);

  let host = "";
  try {
    const u = new URL(raw.trim().replace(/^["']/, "").replace(/["']$/, ""));
    host = u.hostname;
    checks.scheme = u.protocol.replace(":", "");
    checks.host = host;
    checks.user = u.username || "(none)";
    checks.database = u.pathname.replace(/^\//, "") || "(none)";
    checks.password_present = Boolean(u.password);
    checks.pooled = host.includes("-pooler");
  } catch {
    return NextResponse.json<Report>(
      {
        ok: false,
        checks: { ...checks, parse: "failed" },
        hint: "DATABASE_URL is not a valid URL. It should begin postgresql:// and contain no quotes or line breaks.",
      },
      { status: 503 }
    );
  }

  if (/xxx|\.region\./i.test(host)) {
    return NextResponse.json<Report>(
      {
        ok: false,
        checks,
        hint: "This is still the .env.example placeholder. Copy the pooled connection string from the Neon dashboard.",
      },
      { status: 503 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json<Report>(
      { ok: false, checks, hint: "Database is not configured." },
      { status: 503 }
    );
  }

  // ── 3. Can it actually run a query? ──────────────────────────────────────
  const started = Date.now();
  try {
    const rows = await query<{ db: string; at: string }>(
      "select current_database() as db, now()::text as at",
      []
    );
    checks.query = "ok";
    checks.ms = Date.now() - started;
    checks.connected_to = rows[0]?.db ?? null;
    checks.server_time = rows[0]?.at ?? null;
  } catch (e) {
    const message = scrub(e instanceof Error ? e.message : String(e));
    const cause =
      e instanceof Error && e.cause
        ? scrub(
            (e.cause as { code?: string; message?: string }).code ??
              (e.cause as { message?: string }).message ??
              String(e.cause)
          )
        : null;

    let hint = "The connection failed. The error text above is from the database driver.";
    if (/password authentication|authentication failed/i.test(message)) {
      hint =
        "Wrong password. This deployment has a different password than the database expects — usually a rotation that wasn't copied here. Update DATABASE_URL and redeploy.";
    } else if (/fetch failed|ENOTFOUND|getaddrinfo/i.test(message + cause)) {
      hint =
        "The host could not be reached. Check the host above matches the Neon dashboard, and that the Neon project is not deleted or suspended.";
    } else if (/does not exist/i.test(message)) {
      hint = "The role or database named in the connection string does not exist.";
    }

    return NextResponse.json<Report>(
      { ok: false, checks: { ...checks, query: "failed", error: message, cause }, hint },
      { status: 503 }
    );
  }

  // ── 4. Is the schema loaded, and is there data? ──────────────────────────
  try {
    const rows = await query<{ projects: number; links: number }>(
      `select (select count(*) from projects)::int    as projects,
              (select count(*) from project_links)::int as links`,
      []
    );
    checks.schema = "loaded";
    checks.projects = rows[0]?.projects ?? 0;
    checks.links = rows[0]?.links ?? 0;
  } catch (e) {
    const message = scrub(e instanceof Error ? e.message : String(e));
    return NextResponse.json<Report>(
      {
        ok: false,
        checks: { ...checks, schema: "missing", error: message },
        hint: "Connected, but the tables aren't there. Run db/migrations/0001_init.sql against this database.",
      },
      { status: 503 }
    );
  }

  const empty = checks.projects === 0;
  return NextResponse.json<Report>({
    ok: true,
    checks,
    hint: empty
      ? "Everything is connected. There are no projects yet — run the sheet sync to load them."
      : "Everything is connected and the data is there.",
  });
}
