import { NextResponse } from "next/server";
import { listProjectsForPicker } from "@/lib/queries/portfolio";
import { isDatabaseConfigured } from "@/lib/db";
import { CATEGORY_MAP } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Project list for the Google Form's dropdown and for the sheet sync to
 * reconcile against.
 *
 * Each entry carries a `label` (what the form shows) and an `id` (what the
 * script sends back), so renaming a project never breaks the link.
 *
 * Auth: same shared secret as the intake webhook.
 */

function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function GET(request: Request) {
  const expected = process.env.INTAKE_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Intake is not configured on the server." },
      { status: 503 }
    );
  }

  const provided = request.headers.get("x-intake-secret") ?? "";
  if (!provided || !secretMatches(provided, expected)) {
    return NextResponse.json(
      { ok: false, error: "Invalid or missing intake secret." },
      { status: 401 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Database is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    const rows = await listProjectsForPicker();

    // Category disambiguates the handful of names that exist in more than one.
    const projects = rows.map((p) => ({
      id: p.id,
      label: `${p.name} · ${CATEGORY_MAP[p.category].label}`,
      name: p.name,
      category: p.category,
      client: p.client,
    }));

    return NextResponse.json({ ok: true, count: projects.length, projects });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Unknown database error.";
    console.error("[projects] list failed", e);
    return NextResponse.json(
      { ok: false, error: "Could not load projects.", detail },
      { status: 500 }
    );
  }
}
