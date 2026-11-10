import { query } from "@/lib/db";
import type {
  ProjectCategory,
  ProjectWithLinks,
  ProjectLink,
  ProjectRow,
  CategoryStats,
  PortfolioSummary,
  ActivityRow,
} from "@/types/database";

/**
 * Reads for the dashboard.
 *
 * Each project arrives with its links already aggregated in Postgres, so
 * rendering a page is one query rather than one per project.
 *
 * The SQL lives in exported constants so the test harness can run the exact
 * statements the app runs.
 */

type RawProject = ProjectRow & { links: ProjectLink[] | null };

function shape(row: RawProject): ProjectWithLinks {
  const links = row.links ?? [];
  const { links: _omit, ...project } = row;
  return {
    ...project,
    videoLinks: links.filter((l) => l.type === "video"),
    portfolioLinks: links.filter((l) => l.type === "portfolio"),
  };
}

/**
 * Explicit column list rather than `p.*`.
 *
 * Dates and timestamps are cast to text so they arrive as the strings the
 * types promise. Left as native types, a `date` comes back as a JS Date at
 * local midnight, and converting that to ISO lands a day early in any
 * timezone ahead of UTC — which is exactly where this is used.
 */
const PROJECT_COLUMNS = `
  p.id, p.category, p.name, p.client, p.description, p.status,
  p.project_date::text as project_date,
  p.source, p.external_ref, p.progress_pct, p.created_by,
  p.created_at::text as created_at,
  p.updated_at::text as updated_at`;

/** Links aggregated as JSON, pre-sorted, so ordering is identical everywhere. */
const LINKS_JSON = `
  coalesce((
    select json_agg(
      json_build_object(
        'id', l.id, 'project_id', l.project_id, 'type', l.type,
        'label', l.label, 'url', l.url, 'sort_order', l.sort_order,
        'source', l.source, 'created_at', l.created_at::text
      ) order by l.sort_order, l.created_at
    )
    from project_links l
    where l.project_id = p.id
  ), '[]'::json) as links`;

const ORDER = `order by p.project_date desc nulls last, p.created_at desc`;

export const SQL = {
  allProjects: `select ${PROJECT_COLUMNS}, ${LINKS_JSON} from projects p ${ORDER}`,

  projectsByCategory: `
    select ${PROJECT_COLUMNS}, ${LINKS_JSON}
    from projects p
    where p.category = $1::project_category
    ${ORDER}`,

  projectById: `select ${PROJECT_COLUMNS}, ${LINKS_JSON} from projects p where p.id = $1::uuid`,

  categoryStats: `
    select category, total, live, draft, video_links, portfolio_links
    from v_category_stats`,

  summary: `select * from v_portfolio_summary`,

  activity: `select * from activity_log order by created_at desc limit $1`,

  /** Matches the project's own text, or the label/URL of any of its links. */
  search: `
    select ${PROJECT_COLUMNS}, ${LINKS_JSON}
    from projects p
    where p.name ilike $1
       or p.client ilike $1
       or p.description ilike $1
       or exists (
         select 1 from project_links l
         where l.project_id = p.id
           and (l.label ilike $1 or l.url ilike $1)
       )
    ${ORDER}`,

  picker: `select id, name, category, client from projects order by category, name`,
} as const;

export async function getProjects(category?: ProjectCategory): Promise<ProjectWithLinks[]> {
  const rows = category
    ? await query<RawProject>(SQL.projectsByCategory, [category])
    : await query<RawProject>(SQL.allProjects);
  return rows.map(shape);
}

export async function getProjectById(id: string): Promise<ProjectWithLinks | null> {
  const rows = await query<RawProject>(SQL.projectById, [id]);
  return rows.length ? shape(rows[0]!) : null;
}

export async function getCategoryStats(): Promise<CategoryStats[]> {
  const rows = await query<Record<string, unknown>>(SQL.categoryStats);

  // count() is bigint, which arrives as a string — coerce so the UI can sum
  // these without silently concatenating.
  return rows.map((r) => ({
    category: r.category as ProjectCategory,
    total: Number(r.total),
    live: Number(r.live),
    draft: Number(r.draft),
    video_links: Number(r.video_links),
    portfolio_links: Number(r.portfolio_links),
  }));
}

export async function getSummary(): Promise<PortfolioSummary> {
  const rows = await query<Record<string, unknown>>(SQL.summary);
  const r = rows[0] ?? {};

  return {
    total_projects: Number(r.total_projects ?? 0),
    live_projects: Number(r.live_projects ?? 0),
    draft_projects: Number(r.draft_projects ?? 0),
    total_video_links: Number(r.total_video_links ?? 0),
    total_portfolio_links: Number(r.total_portfolio_links ?? 0),
  };
}

export async function getActivity(limit = 12): Promise<ActivityRow[]> {
  return query<ActivityRow>(SQL.activity, [limit]);
}

/** Escapes LIKE wildcards so a literal % or _ matches itself. */
export function likePattern(term: string): string {
  return `%${term.trim().replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
}

export async function searchProjects(term: string): Promise<ProjectWithLinks[]> {
  if (!term.trim()) return [];
  const rows = await query<RawProject>(SQL.search, [likePattern(term)]);
  return rows.map(shape);
}

/** Project list for the Google Sheet / Form dropdown. */
export async function listProjectsForPicker(): Promise<
  Array<{ id: string; name: string; category: ProjectCategory; client: string | null }>
> {
  return query(SQL.picker);
}
