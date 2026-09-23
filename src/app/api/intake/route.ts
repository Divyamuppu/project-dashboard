import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
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
import type { Database, ProjectCategory, ProjectStatus } from "@/types/database";

type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Google Form intake webhook.
 *
 * Apps Script POSTs one form response here on submit or edit.
 *
 * Matching, in order:
 *   1. `response_id` — the same form response, re-delivered or edited
 *   2. project name (plus category when given) — lets the form update projects
 *      that already existed, including the bulk spreadsheet import
 *   3. neither — create a new project
 *
 * Updates are PARTIAL. A field left blank on the form is left alone in the
 * database, so submitting a form to correct one detail can't blank out the rest.
 * Links are added, never removed — an existing link with the same URL is skipped
 * rather than duplicated.
 *
 * Auth: shared secret in the `x-intake-secret` header, compared in constant time.
 */

type Payload = {
  response_id?: unknown;
  date?: unknown;
  project?: unknown;
  name?: unknown;
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

/** Constant-time string compare — avoids leaking the secret via timing. */
function secretMatches(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** A field may arrive as a string, or as an array when the form allows multiple. */
function asText(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map((x) => String(x ?? "")).join("\n");
  return String(v);
}

/** PostgREST treats these as wildcards inside ilike. */
function escapeLike(v: string): string {
  return v.replace(/[%_\\]/g, (m) => `\\${m}`);
}

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

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return bad(400, "Body must be JSON.");
  }

  // ── validate ───────────────────────────────────────────────────────────
  const name = asText(body.project ?? body.name).trim();
  if (!name) return bad(422, "Project name is required.");
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

  const client = asText(body.client).trim();
  const description = asText(body.description).trim();

  // Drive links and any explicit video links both land as video links.
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
  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (e) {
    console.error("[intake] supabase client", e);
    return bad(503, "Database is not configured on the server.");
  }

  try {
    let projectId: string | null = null;
    let matchedBy: "response_id" | "name" | null = null;

    // 1. Same form response, re-delivered or edited.
    if (externalRef) {
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("external_ref", externalRef)
        .maybeSingle();
      if (error) throw error;
      if (data?.id) {
        projectId = data.id;
        matchedBy = "response_id";
      }
    }

    // 2. An existing project with this name — including imported ones.
    //    Category narrows it when given, which matters because a few names
    //    legitimately exist in two categories (a campaign and its BTS cut).
    if (!projectId) {
      let q = supabase.from("projects").select("id, category").ilike("name", escapeLike(name));
      if (category) q = q.eq("category", category);

      const { data, error } = await q;
      if (error) throw error;

      if (data && data.length === 1) {
        projectId = data[0]!.id;
        matchedBy = "name";
      } else if (data && data.length > 1) {
        // Ambiguous — refuse rather than silently updating the wrong one.
        return bad(
          409,
          `"${name}" matches ${data.length} projects${category ? "" : " across different categories"}. ` +
            `Add the category to this form response to say which one.`,
          { categories: data.map((d) => d.category) }
        );
      }
    }

    const created = !projectId;

    if (projectId) {
      // ── partial update: only fields the form actually supplied ──────────
      const patch: ProjectUpdate = {};
      if (category) patch.category = category;
      if (client) patch.client = client;
      if (description) patch.description = description;
      if (status) patch.status = status;
      if (projectDate) patch.project_date = projectDate;
      // Adopt this response so future edits to it match by id, not by name.
      if (externalRef) patch.external_ref = externalRef;

      if (Object.keys(patch).length > 0) {
        const { error } = await supabase.from("projects").update(patch).eq("id", projectId);
        if (error) throw error;
      }
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          // A new project needs a category; park it in Campaigns rather than
          // reject the row, since it can be moved in one click.
          category: category ?? "campaigns",
          name,
          client: client || null,
          description: description || null,
          status: status ?? "live",
          project_date: projectDate,
          source: "form",
          external_ref: externalRef,
        })
        .select("id")
        .single();
      if (error) throw error;
      projectId = data.id;
    }

    // ── links: additive, de-duplicated by URL ───────────────────────────
    let linksAdded = 0;
    if (cleaned.links.length) {
      const { data: existing, error: exErr } = await supabase
        .from("project_links")
        .select("url, type")
        .eq("project_id", projectId);
      if (exErr) throw exErr;

      const have = new Set((existing ?? []).map((l) => `${l.type}|${l.url}`));
      const fresh = cleaned.links.filter((l) => !have.has(`${l.type}|${l.url}`));

      if (fresh.length) {
        const base = existing?.length ?? 0;
        const { error } = await supabase.from("project_links").insert(
          fresh.map((l, i) => ({
            project_id: projectId as string,
            type: l.type,
            label: l.label,
            url: l.url,
            sort_order: base + i,
            source: "form",
          }))
        );
        if (error) throw error;
        linksAdded = fresh.length;
      }
    }

    const linkNote = linksAdded ? ` (+${linksAdded} link${linksAdded > 1 ? "s" : ""})` : "";
    await supabase.from("activity_log").insert({
      project_id: projectId,
      action_type: created ? "form_submission" : "form_update",
      description: created
        ? `${name} submitted via form${linkNote}`
        : `${name} updated from form${linkNote}`,
    });

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
    const message = e instanceof Error ? e.message : "Unknown database error.";
    console.error("[intake] write failed", e);
    return bad(500, "Could not save the submission.", message);
  }
}

/** Lets you confirm the endpoint is deployed and configured without writing. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "intake",
    configured: Boolean(process.env.INTAKE_SECRET),
    behaviour: {
      matching: "response_id, then project name (+ category), then create",
      updates: "partial — blank form fields leave existing values alone",
      links: "added, never removed; duplicate URLs skipped",
    },
    expects: {
      method: "POST",
      header: "x-intake-secret",
      body: {
        response_id: "string (optional but recommended — makes resubmits idempotent)",
        date: "YYYY-MM-DD or dd/mm/yyyy",
        project: "string (required — also the key for matching an existing project)",
        category: `one of ${CATEGORY_KEYS.join(" | ")}`,
        client: "string (optional)",
        status: "live | draft",
        description: "string (optional)",
        drive_links: "string — one or more URLs, any separator",
        portfolio_links: "string — one or more URLs, any separator",
      },
    },
  });
}