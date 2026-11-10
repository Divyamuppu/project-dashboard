import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query, queryOne, isDatabaseConfigured } from "@/lib/db";
import {
  CATEGORY_KEYS,
  MAX_NAME_LENGTH,
  cleanLinks,
  extractUrls,
  labelFromUrl,
  parseCategory,
  parseDate,
  type CleanLink,
} from "@/lib/links";
import type { ProjectCategory, ProjectStatus } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Intake webhook for the Google Sheet sync and the Google Form.
 *
 * Matching, in order:
 *   1. `project_id`  — the row's stored Dashboard ID, or the form's dropdown.
 *                      Exact, so renaming a project is safe.
 *   2. `response_id` — the same sheet row or form response, re-delivered.
 *   3. project name (plus category when given) — covers rows that have never
 *      synced and projects loaded by the original import.
 *   4. none of those — create a new project.
 *
 * Updates are PARTIAL: a field left blank is left alone in the database, so
 * correcting one detail can't blank out the rest. Links are added, never
 * removed; a link whose URL is already on the project is skipped.
 *
 * Auth: shared secret in `x-intake-secret`, compared in constant time.
 */

type Payload = {
  response_id?: unknown;
  project_id?: unknown;
  date?: unknown;
  project?: unknown;
  name?: unknown;
  brand?: unknown;
  client?: unknown;
  category?: unknown;
  status?: unknown;
  description?: unknown;
  drive_links?: unknown;
  video_links?: unknown;
  portfolio_links?: unknown;
};

function bad(status: number, error: string, detail?: unknown) {
  return NextResponse.json({ ok: false, error, detail }, { status });
}

function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** A field may arrive as a string, or as an array when a form allows multiple. */
function asText(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map((x) => String(x ?? "")).join("\n");
  return String(v);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const expected = process.env.INTAKE_SECRET;
  if (!expected) {
    console.error("[intake] INTAKE_SECRET is not set — refusing request");
    return bad(503, "Intake is not configured on the server.");
  }

  const provided = request.headers.get("x-intake-secret") ?? "";
  if (!provided || !secretMatches(provided, expected)) {
    return bad(401, "Invalid or missing intake secret.");
  }

  if (!isDatabaseConfigured()) {
    return bad(503, "Database is not configured on the server.");
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return bad(400, "Body must be JSON.");
  }

  // ── validate ───────────────────────────────────────────────────────────
  const rawTargetId = asText(body.project_id).trim();
  // A sheet cell can hold a stale "ERROR: ..." string from a failed sync.
  const targetId = rawTargetId && UUID.test(rawTargetId) ? rawTargetId : null;
  if (rawTargetId && !targetId) {
    return bad(422, `"${rawTargetId}" isn't a valid project id. Clear that Dashboard ID cell.`);
  }

  const name = asText(body.project ?? body.name).trim();
  if (!name && !targetId) return bad(422, "Project name is required.");
  if (name.length > MAX_NAME_LENGTH)
    return bad(422, `Project name must be under ${MAX_NAME_LENGTH} characters.`);

  const categoryRaw = asText(body.category).trim();
  const category: ProjectCategory | null = categoryRaw ? parseCategory(categoryRaw) : null;
  if (categoryRaw && !category) {
    return bad(
      422,
      `Unrecognised category "${categoryRaw}". Expected one of: ${CATEGORY_KEYS.join(", ")}.`
    );
  }

  const statusRaw = asText(body.status).trim().toLowerCase();
  let status: ProjectStatus | null = null;
  if (statusRaw) {
    if (statusRaw !== "live" && statusRaw !== "draft")
      return bad(422, `Unrecognised status "${statusRaw}". Expected live or draft.`);
    status = statusRaw;
  }

  const projectDate = parseDate(body.date);
  if (body.date && !projectDate) {
    return bad(422, `Couldn't read "${asText(body.date)}" as a date.`);
  }

  const client = asText(body.brand ?? body.client).trim();
  const description = asText(body.description).trim();

  const videoUrls = [
    ...extractUrls(asText(body.drive_links)),
    ...extractUrls(asText(body.video_links)),
  ];
  const portfolioUrls = extractUrls(asText(body.portfolio_links));

  const candidate: CleanLink[] = [
    ...videoUrls.map((url) => ({ type: "video" as const, label: labelFromUrl(url), url })),
    ...portfolioUrls.map((url) => ({
      type: "portfolio" as const,
      label: labelFromUrl(url),
      url,
    })),
  ];

  const cleaned = cleanLinks(candidate);
  if (!cleaned.ok) return bad(422, cleaned.error);

  const externalRef = asText(body.response_id).trim() || null;

  // ── write ──────────────────────────────────────────────────────────────
  try {
    let projectId: string | null = null;
    let matchedBy: "project_id" | "response_id" | "name" | null = null;

    // 1. Explicit id — from the sheet's Dashboard ID column or a form dropdown.
    if (targetId) {
      const row = await queryOne<{ id: string }>(
        `select id from projects where id = $1::uuid`,
        [targetId]
      );
      if (!row) {
        return bad(
          422,
          "That project no longer exists in the dashboard. Clear its Dashboard ID cell and it will be recreated."
        );
      }
      projectId = row.id;
      matchedBy = "project_id";
    }

    // 2. The same sheet row or form response, re-delivered.
    if (!projectId && externalRef) {
      const row = await queryOne<{ id: string }>(
        `select id from projects where external_ref = $1`,
        [externalRef]
      );
      if (row) {
        projectId = row.id;
        matchedBy = "response_id";
      }
    }

    // 3. By name. Category narrows it, which matters because a few names
    //    exist in two categories (a campaign and its BTS cut).
    if (!projectId && name) {
      const rows = await query<{ id: string; category: ProjectCategory }>(
        `select id, category from projects
         where lower(name) = lower($1)
           and ($2::project_category is null or category = $2::project_category)`,
        [name, category]
      );

      if (rows.length === 1) {
        projectId = rows[0]!.id;
        matchedBy = "name";
      } else if (rows.length > 1) {
        return bad(
          409,
          `"${name}" matches ${rows.length} projects${category ? "" : " across different categories"}. ` +
            `Add the category so it's clear which one you mean.`,
          { categories: rows.map((r) => r.category) }
        );
      }
    }

    const created = !projectId;

    if (projectId) {
      // Partial update — only the fields this submission actually carried.
      // coalesce leaves a column alone when its parameter is null.
      await query(
        `update projects set
           category     = coalesce($2::project_category, category),
           name         = coalesce(nullif($3, ''), name),
           client       = coalesce(nullif($4, ''), client),
           description  = coalesce(nullif($5, ''), description),
           status       = coalesce($6::project_status, status),
           project_date = coalesce($7::date, project_date),
           external_ref = coalesce($8, external_ref)
         where id = $1::uuid`,
        [
          projectId,
          category,
          // A rename is only safe when the project was found by id — renaming
          // after a name match would make the next submission miss.
          matchedBy === "project_id" ? name : "",
          client,
          description,
          status,
          projectDate,
          externalRef,
        ]
      );
    } else {
      const row = await queryOne<{ id: string }>(
        `insert into projects
           (category, name, client, description, status, project_date, source, external_ref)
         values ($1::project_category, $2, nullif($3,''), nullif($4,''),
                 $5::project_status, $6::date, 'sheet', $7)
         returning id`,
        [
          // A new project needs a category; park it in Campaigns rather than
          // reject the row, since it's one click to move.
          category ?? "campaigns",
          name,
          client,
          description,
          status ?? "live",
          projectDate,
          externalRef,
        ]
      );
      if (!row) return bad(500, "Could not create the project.");
      projectId = row.id;
    }

    // ── links: additive, de-duplicated by (type, url) in the database ────
    let linksAdded = 0;
    if (cleaned.links.length) {
      const inserted = await query<{ id: string }>(
        `with base as (
           select coalesce(max(sort_order) + 1, 0) as n
           from project_links where project_id = $1::uuid
         ),
         incoming as (
           select t.type::link_type as type, t.label, t.url, t.ord
           from unnest($2::text[], $3::text[], $4::text[], $5::int[]) as t(type, label, url, ord)
         )
         insert into project_links (project_id, type, label, url, sort_order, source)
         select $1::uuid, i.type, i.label, i.url, base.n + i.ord, 'sheet'
         from incoming i, base
         where not exists (
           select 1 from project_links e
           where e.project_id = $1::uuid and e.type = i.type and e.url = i.url
         )
         returning id`,
        [
          projectId,
          cleaned.links.map((l) => l.type),
          cleaned.links.map((l) => l.label),
          cleaned.links.map((l) => l.url),
          cleaned.links.map((_, i) => i),
        ]
      );
      linksAdded = inserted.length;
    }

    const label =
      name ||
      (await queryOne<{ name: string }>(`select name from projects where id = $1::uuid`, [
        projectId,
      ]))?.name ||
      "A project";

    const linkNote = linksAdded ? ` (+${linksAdded} link${linksAdded > 1 ? "s" : ""})` : "";
    await query(
      `insert into activity_log (project_id, action_type, description) values ($1::uuid, $2, $3)`,
      [
        projectId,
        created ? "sheet_created" : "sheet_updated",
        created ? `${label} added from the sheet${linkNote}` : `${label} updated from the sheet${linkNote}`,
      ]
    );

    revalidatePath("/");
    CATEGORY_KEYS.forEach((k) => revalidatePath(`/c/${k}`));

    return NextResponse.json({
      ok: true,
      created,
      matched_by: matchedBy,
      project_id: projectId,
      links_added: linksAdded,
      links_skipped: cleaned.links.length - linksAdded,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Unknown database error.";
    console.error("[intake] write failed", e);
    return bad(500, "Could not save the submission.", detail);
  }
}

/** Confirms the endpoint is deployed and configured, without writing. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "intake",
    configured: Boolean(process.env.INTAKE_SECRET),
    database: isDatabaseConfigured() ? "configured" : "DATABASE_URL not set",
    behaviour: {
      matching: "project_id, then response_id, then project name (+ category), then create",
      updates: "partial — blank fields leave existing values alone",
      links: "added, never removed; duplicate URLs skipped",
    },
    expects: {
      method: "POST",
      header: "x-intake-secret",
      body: {
        project_id: "uuid (optional) — the sheet's Dashboard ID, survives renames",
        response_id: "string (optional) — stable per sheet row / form response",
        date: "YYYY-MM-DD or dd/mm/yyyy",
        project: "string (required unless project_id is given)",
        brand: "string (optional) — stored as the client",
        category: `one of ${CATEGORY_KEYS.join(" | ")}`,
        status: "live | draft",
        description: "string (optional)",
        drive_links: "string — one or more URLs, any separator",
        portfolio_links: "string — one or more URLs, any separator",
      },
    },
  });
}
