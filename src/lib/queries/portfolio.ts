import { createClient } from "@/lib/supabase/server";
import type {
  ProjectCategory,
  ProjectWithLinks,
  ProjectLink,
  CategoryStats,
  PortfolioSummary,
  ActivityRow,
  ProjectSource,
} from "@/types/database";

const PROJECT_SELECT = `
  id, category, name, client, description, status, project_date, source, external_ref,
  created_by, created_at, updated_at,
  project_links ( id, project_id, type, label, url, sort_order, source, created_at )
`;

type RawProject = {
  id: string;
  category: ProjectCategory;
  name: string;
  client: string | null;
  description: string | null;
  status: "live" | "draft";
  project_date: string | null;
  source: ProjectSource;
  external_ref: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  project_links: ProjectLink[] | null;
};

function shape(row: RawProject): ProjectWithLinks {
  const links = row.project_links ?? [];
  const bySort = (a: ProjectLink, b: ProjectLink) =>
    a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);
  return {
    ...row,
    videoLinks: links.filter((l) => l.type === "video").sort(bySort),
    portfolioLinks: links.filter((l) => l.type === "portfolio").sort(bySort),
  };
}

export async function getProjects(
  category?: ProjectCategory
): Promise<ProjectWithLinks[]> {
  const supabase = await createClient();
  let query = supabase.from("projects").select(PROJECT_SELECT);
  if (category) query = query.eq("category", category);

  const { data, error } = await query
    .order("project_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return ((data ?? []) as unknown as RawProject[]).map(shape);
}

export async function getCategoryStats(): Promise<CategoryStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("v_category_stats").select("*");
  if (error) throw new Error(`Failed to load category stats: ${error.message}`);
  return data ?? [];
}

export async function getSummary(): Promise<PortfolioSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("v_portfolio_summary").select("*").single();
  if (error) throw new Error(`Failed to load summary: ${error.message}`);
  return data;
}

export async function getActivity(limit = 12): Promise<ActivityRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load activity: ${error.message}`);
  return data ?? [];
}

/**
 * Global search. Matches project name/client/description in the database, and
 * link label/url via a second pass, then merges — so searching a URL or a link
 * label surfaces the project that holds it.
 */
export async function searchProjects(term: string): Promise<ProjectWithLinks[]> {
  const q = term.trim();
  if (!q) return [];
  const supabase = await createClient();
  const pattern = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

  const [projectHits, linkHits] = await Promise.all([
    supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .or(`name.ilike.${pattern},client.ilike.${pattern},description.ilike.${pattern}`),
    supabase
      .from("project_links")
      .select("project_id")
      .or(`label.ilike.${pattern},url.ilike.${pattern}`),
  ]);

  if (projectHits.error) throw new Error(`Search failed: ${projectHits.error.message}`);
  if (linkHits.error) throw new Error(`Search failed: ${linkHits.error.message}`);

  const found = new Map<string, ProjectWithLinks>();
  ((projectHits.data ?? []) as unknown as RawProject[]).forEach((r) =>
    found.set(r.id, shape(r))
  );

  const missingIds = [
    ...new Set((linkHits.data ?? []).map((l) => l.project_id)),
  ].filter((id) => !found.has(id));

  if (missingIds.length) {
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .in("id", missingIds);
    if (error) throw new Error(`Search failed: ${error.message}`);
    ((data ?? []) as unknown as RawProject[]).forEach((r) => found.set(r.id, shape(r)));
  }

  return [...found.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}
