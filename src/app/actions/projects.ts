"use server";

import { revalidatePath } from "next/cache";
import { query, queryOne, transaction } from "@/lib/db";
import { CATEGORY_MAP } from "@/types/database";
import { CATEGORY_KEYS, MAX_NAME_LENGTH, cleanLinks, parseDate } from "@/lib/links";
import { requireAdmin } from "@/lib/auth";
import type { ProjectCategory, ProjectStatus, LinkType } from "@/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type LinkInput = { id?: string; type: LinkType; label: string; url: string };

function revalidateAll(category?: ProjectCategory) {
  revalidatePath("/");
  CATEGORY_KEYS.forEach((k) => revalidatePath(`/c/${k}`));
  if (category) revalidatePath(`/c/${category}`);
}

/** Writes an entry to the activity feed. Never throws — a lost log line
 *  must not fail the write that succeeded. */
async function log(projectId: string | null, action: string, description: string) {
  try {
    await query(
      `insert into activity_log (project_id, action_type, description) values ($1, $2, $3)`,
      [projectId, action, description]
    );
  } catch (e) {
    console.error("[activity_log]", e);
  }
}

function message(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

// ── CREATE ───────────────────────────────────────────────────────────────
export async function createProject(input: {
  category: ProjectCategory;
  name: string;
  client?: string;
  description?: string;
  status: ProjectStatus;
  projectDate?: string;
  links: LinkInput[];
}): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Project name is required." };
  if (name.length > MAX_NAME_LENGTH) return { ok: false, error: "Project name is too long." };
  if (!CATEGORY_KEYS.includes(input.category))
    return { ok: false, error: "Pick a valid category." };

  const cleaned = cleanLinks(input.links ?? []);
  if (!cleaned.ok) return cleaned;

  try {
    const project = await queryOne<{ id: string }>(
      `insert into projects (category, name, client, description, status, project_date, source)
       values ($1::project_category, $2, $3, $4, $5::project_status, $6::date, 'manual')
       returning id`,
      [
        input.category,
        name,
        input.client?.trim() || null,
        input.description?.trim() || null,
        input.status,
        parseDate(input.projectDate),
      ]
    );
    if (!project) return { ok: false, error: "Could not create project." };

    if (cleaned.links.length) {
      await insertLinks(project.id, cleaned.links, "manual");
    }

    await log(
      project.id,
      "project_created",
      `${name} added to ${CATEGORY_MAP[input.category].label}`
    );
    revalidateAll(input.category);
    return { ok: true };
  } catch (e) {
    console.error("[createProject]", e);
    return { ok: false, error: message(e, "Could not create project.") };
  }
}

/**
 * Inserts links in one statement using unnest, rather than one round trip per
 * link — which matters on serverless, where each round trip is a fetch.
 */
async function insertLinks(
  projectId: string,
  links: Array<{ type: LinkType; label: string; url: string }>,
  source: string,
  startOrder = 0
): Promise<void> {
  if (!links.length) return;

  await query(
    `insert into project_links (project_id, type, label, url, sort_order, source)
     select $1::uuid, t.type::link_type, t.label, t.url, t.ord, $2::row_source
     from unnest($3::text[], $4::text[], $5::text[], $6::int[]) as t(type, label, url, ord)`,
    [
      projectId,
      source,
      links.map((l) => l.type),
      links.map((l) => l.label),
      links.map((l) => l.url),
      links.map((_, i) => startOrder + i),
    ]
  );
}

// ── UPDATE (project fields + the full link set) ──────────────────────────
export async function updateProject(input: {
  id: string;
  category: ProjectCategory;
  name: string;
  client?: string;
  description?: string;
  status: ProjectStatus;
  projectDate?: string;
  links: LinkInput[];
}): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Project name is required." };
  if (name.length > MAX_NAME_LENGTH) return { ok: false, error: "Project name is too long." };
  if (!CATEGORY_KEYS.includes(input.category))
    return { ok: false, error: "Pick a valid category." };

  const cleaned = cleanLinks(input.links ?? []);
  if (!cleaned.ok) return cleaned;

  try {
    // Reconcile the link set: rows the dialog still shows are kept and
    // updated, anything else on the project is removed, new rows inserted.
    // One transaction, so the project is never left with a partial link set.
    const keptIds = cleaned.links.filter((l) => l.id).map((l) => l.id as string);
    const kept = cleaned.links.filter((l) => l.id);
    const fresh = cleaned.links.filter((l) => !l.id);
    const orderOf = new Map(cleaned.links.map((l, i) => [l.id ?? `new:${i}`, i]));

    const statements: Array<{ text: string; params?: unknown[] }> = [
      {
        text: `update projects
               set category = $2::project_category, name = $3, client = $4,
                   description = $5, status = $6::project_status, project_date = $7::date
               where id = $1::uuid`,
        params: [
          input.id,
          input.category,
          name,
          input.client?.trim() || null,
          input.description?.trim() || null,
          input.status,
          parseDate(input.projectDate),
        ],
      },
      {
        text: `delete from project_links
               where project_id = $1::uuid
                 and ($2::uuid[] = '{}' or not (id = any($2::uuid[])))`,
        params: [input.id, keptIds],
      },
    ];

    for (const l of kept) {
      statements.push({
        text: `update project_links
               set type = $2::link_type, label = $3, url = $4, sort_order = $5
               where id = $1::uuid and project_id = $6::uuid`,
        params: [l.id, l.type, l.label, l.url, orderOf.get(l.id as string) ?? 0, input.id],
      });
    }

    if (fresh.length) {
      statements.push({
        text: `insert into project_links (project_id, type, label, url, sort_order, source)
               select $1::uuid, t.type::link_type, t.label, t.url, t.ord, 'manual'
               from unnest($2::text[], $3::text[], $4::text[], $5::int[]) as t(type, label, url, ord)`,
        params: [
          input.id,
          fresh.map((l) => l.type),
          fresh.map((l) => l.label),
          fresh.map((l) => l.url),
          fresh.map((l, i) => orderOf.get(`new:${cleaned.links.indexOf(l)}`) ?? i),
        ],
      });
    }

    await transaction(statements);

    await log(input.id, "project_updated", `${name} updated`);
    revalidateAll(input.category);
    return { ok: true };
  } catch (e) {
    console.error("[updateProject]", e);
    return { ok: false, error: message(e, "Could not save changes.") };
  }
}

// ── DELETE ───────────────────────────────────────────────────────────────
export async function deleteProject(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    // Links cascade; the activity row keeps its description with a null
    // project_id, so the feed still shows that it happened.
    const row = await queryOne<{ name: string; category: ProjectCategory }>(
      `delete from projects where id = $1::uuid returning name, category`,
      [id]
    );
    if (!row) return { ok: false, error: "That project no longer exists." };

    await log(null, "project_deleted", `${row.name} deleted`);
    revalidateAll(row.category);
    return { ok: true };
  } catch (e) {
    console.error("[deleteProject]", e);
    return { ok: false, error: message(e, "Could not delete the project.") };
  }
}

// ── STATUS TOGGLE ────────────────────────────────────────────────────────
export async function setProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  if (status !== "live" && status !== "draft")
    return { ok: false, error: "Status must be live or draft." };

  try {
    const row = await queryOne<{ name: string; category: ProjectCategory }>(
      `update projects set status = $2::project_status
       where id = $1::uuid
       returning name, category`,
      [id, status]
    );
    if (!row) return { ok: false, error: "That project no longer exists." };

    await log(id, "status_changed", `${row.name} marked ${status}`);
    revalidateAll(row.category);
    return { ok: true };
  } catch (e) {
    console.error("[setProjectStatus]", e);
    return { ok: false, error: message(e, "Could not change the status.") };
  }
}

// ── SINGLE-LINK CRUD (quick add / remove on a card) ──────────────────────
export async function addLink(input: {
  projectId: string;
  type: LinkType;
  label: string;
  url: string;
}): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const cleaned = cleanLinks([{ type: input.type, label: input.label, url: input.url }]);
  if (!cleaned.ok) return cleaned;
  if (!cleaned.links.length) return { ok: false, error: "Enter a URL." };
  const link = cleaned.links[0]!;

  try {
    const project = await queryOne<{ name: string; category: ProjectCategory }>(
      `select name, category from projects where id = $1::uuid`,
      [input.projectId]
    );
    if (!project) return { ok: false, error: "That project no longer exists." };

    // Appended after whatever is already on the project, and skipped silently
    // if the same URL of the same type is already there.
    const inserted = await query<{ id: string }>(
      `insert into project_links (project_id, type, label, url, sort_order, source)
       select $1::uuid, $2::link_type, $3, $4,
              coalesce((select max(sort_order) + 1 from project_links where project_id = $1::uuid), 0),
              'manual'
       where not exists (
         select 1 from project_links
         where project_id = $1::uuid and type = $2::link_type and url = $4
       )
       returning id`,
      [input.projectId, link.type, link.label, link.url]
    );

    if (!inserted.length) {
      return { ok: false, error: "That link is already on this project." };
    }

    await log(
      input.projectId,
      "link_added",
      `${link.type === "video" ? "Video" : "Portfolio"} link added to ${project.name}`
    );
    revalidateAll(project.category);
    return { ok: true };
  } catch (e) {
    console.error("[addLink]", e);
    return { ok: false, error: message(e, "Could not add the link.") };
  }
}

export async function deleteLink(linkId: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  try {
    const row = await queryOne<{ project_id: string; type: LinkType }>(
      `delete from project_links where id = $1::uuid returning project_id, type`,
      [linkId]
    );
    if (!row) return { ok: false, error: "That link no longer exists." };

    const project = await queryOne<{ name: string; category: ProjectCategory }>(
      `select name, category from projects where id = $1::uuid`,
      [row.project_id]
    );

    await log(
      row.project_id,
      "link_removed",
      `${row.type === "video" ? "Video" : "Portfolio"} link removed from ${project?.name ?? "a project"}`
    );
    revalidateAll(project?.category);
    return { ok: true };
  } catch (e) {
    console.error("[deleteLink]", e);
    return { ok: false, error: message(e, "Could not remove the link.") };
  }
}
