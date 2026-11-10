// Row types for the Neon schema in db/migrations/0001_init.sql.
//
// These are hand-written plain types — there's no generated client to satisfy,
// so a row is just the shape the SQL returns.

export type ProjectCategory = "social" | "campaigns" | "corporate" | "events" | "bts";
export type ProjectStatus = "live" | "draft";
export type LinkType = "video" | "portfolio";
export type ProjectSource = "manual" | "form" | "import" | "sheet";
export type TeamRole = "admin" | "member";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  category: ProjectCategory;
  name: string;
  client: string | null;
  description: string | null;
  status: ProjectStatus;
  project_date: string | null;
  source: ProjectSource;
  external_ref: string | null;
  progress_pct: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectLink = {
  id: string;
  project_id: string;
  type: LinkType;
  label: string;
  url: string;
  sort_order: number;
  source: ProjectSource;
  created_at: string;
};

export type ActivityRow = {
  id: string;
  actor_id: string | null;
  project_id: string | null;
  action_type: string;
  description: string;
  created_at: string;
};

export type CategoryStats = {
  category: ProjectCategory;
  total: number;
  live: number;
  draft: number;
  video_links: number;
  portfolio_links: number;
};

export type PortfolioSummary = {
  total_projects: number;
  live_projects: number;
  draft_projects: number;
  total_video_links: number;
  total_portfolio_links: number;
};

/** A project with its links split by type — what the UI renders. */
export type ProjectWithLinks = ProjectRow & {
  videoLinks: ProjectLink[];
  portfolioLinks: ProjectLink[];
};

export const CATEGORIES: { key: ProjectCategory; label: string; hex: string }[] = [
  { key: "social", label: "Social", hex: "#2563A6" },
  { key: "campaigns", label: "Campaigns", hex: "#1F5A52" },
  { key: "corporate", label: "Corporate Films", hex: "#7C4FC9" },
  { key: "events", label: "Event Films", hex: "#C98A22" },
  { key: "bts", label: "BTS", hex: "#B5257E" },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<ProjectCategory, (typeof CATEGORIES)[number]>;
