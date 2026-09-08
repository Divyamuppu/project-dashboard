"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_MAP } from "@/types/database";
import type { ProjectCategory, ProjectStatus, LinkType } from "@/types/database";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type LinkInput = { id?: string; type: LinkType; label: string; url: string };

const CATEGORY_KEYS: ProjectCategory[] = ["social", "campaigns", "corporate", "events", "bts"];

// ── validation ───────────────────────────────────────────────────────────
function normalizeUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

function cleanLinks(links: LinkInput[]): { ok: true; links: LinkInput[] } | { ok: false; error: string } {
  const out: LinkInput[] = [];
  for (const l of links) {
    if (!l.url?.trim() && !l.label?.trim()) continue; // skip untouched rows
    const url = normalizeUrl(l.url ?? "");
    if (!url) return { ok: false, error: `"${l.label || l.url}" isn't a valid URL.` };
    if (l.type !== "video" && l.type !== "portfolio")
      return { ok: false, error: "Unknown link type." };
    const label = (l.label ?? "").trim() || new URL(url).hostname.replace(/^www\./, "");
    if (label.length > 120) return { ok: false, error: "Link labels must be under 120 characters." };
    out.push({ id: l.id, type: l.type, label, url });
  }
  return { ok: true, links: out };
}

// Auth is disabled in this build: writes are attributed to no one.
// Re-add sign-in by restoring the auth check here and in middleware.
async function currentMemberId(
  _supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  return null;
}

async function log(
  supabase: Awaited<ReturnType<typeof createClient>>,
  actorId: string | null,
  projectId: string | null,
  action: string,
  description: string
) {
  await supabase.from("activity_log").insert({
    actor_id: actorId,
    project_id: projectId,
    action_type: action,
    description,
  });
}

function revalidateAll(category?: ProjectCategory) {
  revalidatePath("/");
  if (category) revalidatePath(`/c/${category}`);
  CATEGORY_KEYS.forEach((k) => revalidatePath(`/c/${k}`));
}

// ── CREATE ───────────────────────────────────────────────────────────────
export async function createProject(input: {
  category: ProjectCategory;
  name: string;
  client?: string;
  description?: string;
  status: ProjectStatus;
  links: LinkInput[];
}): Promise<ActionResult> {
  const supabase = await createClient();
  const memberId = await currentMemberId(supabase);

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Project name is required." };
  if (name.length > 160) return { ok: false, error: "Project name is too long." };
  if (!CATEGORY_KEYS.includes(input.category))
    return { ok: false, error: "Pick a valid category." };

  const cleaned = cleanLinks(input.links ?? []);
  if (!cleaned.ok) return cleaned;

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      category: input.category,
      name,
      client: input.client?.trim() || null,
      description: input.description?.trim() || null,
      status: input.status,
      created_by: memberId,
    })
    .select("id")
    .single();

  if (error || !project) return { ok: false, error: error?.message ?? "Could not create project." };

  if (cleaned.links.length) {
    const { error: linkErr } = await supabase.from("project_links").insert(
      cleaned.links.map((l, i) => ({
        project_id: project.id,
        type: l.type,
        label: l.label,
        url: l.url,
        sort_order: i,
      }))
    );
    if (linkErr) return { ok: false, error: `Project saved, but links failed: ${linkErr.message}` };
  }

  await log(
    supabase,
    memberId,
    project.id,
    "project_created",
    `${name} added to ${CATEGORY_MAP[input.category].label}`
  );
  revalidateAll(input.category);
  return { ok: true };
}

// ── UPDATE (project fields + full link set) ──────────────────────────────
export async function updateProject(input: {
  id: string;
  category: ProjectCategory;
  name: string;
  client?: string;
  description?: string;
  status: ProjectStatus;
  links: LinkInput[];
}): Promise<ActionResult> {
  const supabase = await createClient();
  const memberId = await currentMemberId(supabase);

  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Project name is required." };
  if (!CATEGORY_KEYS.includes(input.category))
    return { ok: false, error: "Pick a valid category." };

  const cleaned = cleanLinks(input.links ?? []);
  if (!cleaned.ok) return cleaned;

  const { error } = await supabase
    .from("projects")
    .update({
      category: input.category,
      name,
      client: input.client?.trim() || null,
      description: input.description?.trim() || null,
      status: input.status,
    })
    .eq("id", input.id);
  if (error) return { ok: false, error: error.message };

  // Reconcile links: delete removed, update kept, insert new.
  const { data: existing, error: exErr } = await supabase
    .from("project_links")
    .select("id")
    .eq("project_id", input.id);
  if (exErr) return { ok: false, error: exErr.message };

  const keptIds = new Set(cleaned.links.filter((l) => l.id).map((l) => l.id as string));
  const toDelete = (existing ?? []).map((r) => r.id).filter((id) => !keptIds.has(id));

  if (toDelete.length) {
    const { error: delErr } = await supabase.from("project_links").delete().in("id", toDelete);
    if (delErr) return { ok: false, error: delErr.message };
  }

  for (const [i, l] of cleaned.links.entries()) {
    if (l.id) {
      const { error: upErr } = await supabase
        .from("project_links")
        .update({ type: l.type, label: l.label, url: l.url, sort_order: i })
        .eq("id", l.id);
      if (upErr) return { ok: false, error: upErr.message };
    } else {
      const { error: insErr } = await supabase.from("project_links").insert({
        project_id: input.id,
        type: l.type,
        label: l.label,
        url: l.url,
        sort_order: i,
      });
      if (insErr) return { ok: false, error: insErr.message };
    }
  }

  await log(supabase, memberId, input.id, "project_updated", `${name} updated`);
  revalidateAll(input.category);
  return { ok: true };
}

// ── DELETE ───────────────────────────────────────────────────────────────
export async function deleteProject(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const memberId = await currentMemberId(supabase);

  const { data: project } = await supabase
    .from("projects")
    .select("name, category")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  await log(supabase, memberId, null, "project_deleted", `${project?.name ?? "A project"} deleted`);
  revalidateAll(project?.category as ProjectCategory | undefined);
  return { ok: true };
}

// ── STATUS TOGGLE ────────────────────────────────────────────────────────
export async function setProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const memberId = await currentMemberId(supabase);

  const { data, error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id)
    .select("name, category")
    .single();
  if (error) return { ok: false, error: error.message };

  await log(supabase, memberId, id, "status_changed", `${data.name} marked ${status}`);
  revalidateAll(data.category);
  return { ok: true };
}

// ── SINGLE-LINK CRUD (quick add / remove from a card) ────────────────────
export async function addLink(input: {
  projectId: string;
  type: LinkType;
  label: string;
  url: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const memberId = await currentMemberId(supabase);

  const cleaned = cleanLinks([{ type: input.type, label: input.label, url: input.url }]);
  if (!cleaned.ok) return cleaned;
  if (!cleaned.links.length) return { ok: false, error: "Enter a URL." };
  const link = cleaned.links[0]!;

  const { count } = await supabase
    .from("project_links")
    .select("id", { count: "exact", head: true })
    .eq("project_id", input.projectId)
    .eq("type", input.type);

  const { error } = await supabase.from("project_links").insert({
    project_id: input.projectId,
    type: link.type,
    label: link.label,
    url: link.url,
    sort_order: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };

  const { data: project } = await supabase
    .from("projects")
    .select("name, category")
    .eq("id", input.projectId)
    .single();

  await log(
    supabase,
    memberId,
    input.projectId,
    "link_added",
    `${input.type === "video" ? "Video" : "Portfolio"} link added to ${project?.name ?? "a project"}`
  );
  revalidateAll(project?.category as ProjectCategory | undefined);
  return { ok: true };
}

export async function deleteLink(linkId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const memberId = await currentMemberId(supabase);

  const { data: link } = await supabase
    .from("project_links")
    .select("project_id, type")
    .eq("id", linkId)
    .single();

  const { error } = await supabase.from("project_links").delete().eq("id", linkId);
  if (error) return { ok: false, error: error.message };

  if (link) {
    const { data: project } = await supabase
      .from("projects")
      .select("name, category")
      .eq("id", link.project_id)
      .single();
    await log(
      supabase,
      memberId,
      link.project_id,
      "link_removed",
      `${link.type === "video" ? "Video" : "Portfolio"} link removed from ${project?.name ?? "a project"}`
    );
    revalidateAll(project?.category as ProjectCategory | undefined);
  }
  return { ok: true };
}
