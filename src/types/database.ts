// Matches supabase/migrations/0001_init.sql.
// Regenerate against a live project with: npm run gen:types

export type ProjectCategory = "social" | "campaigns" | "corporate" | "events" | "bts";
export type ProjectStatus = "live" | "draft";
export type LinkType = "video" | "portfolio";
export type ProjectSource = "manual" | "form" | "import";
export type TeamRole = "admin" | "member";

export interface Database {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          role: TeamRole;
          created_at: string;
        };
        Insert: { name: string; email: string; auth_user_id?: string | null; role?: TeamRole };
        Update: { name?: string; email?: string; role?: TeamRole };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          category: ProjectCategory;
          name: string;
          client: string | null;
          description: string | null;
          status: ProjectStatus;
          project_date: string | null;
          source: ProjectSource;
          external_ref: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          category: ProjectCategory;
          name: string;
          client?: string | null;
          description?: string | null;
          status?: ProjectStatus;
          project_date?: string | null;
          source?: ProjectSource;
          external_ref?: string | null;
          created_by?: string | null;
        };
        Update: {
          category?: ProjectCategory;
          name?: string;
          client?: string | null;
          description?: string | null;
          status?: ProjectStatus;
          project_date?: string | null;
          source?: ProjectSource;
          external_ref?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "team_members";
            referencedColumns: ["id"];
          },
        ];
      };
      project_links: {
        Row: {
          id: string;
          project_id: string;
          type: LinkType;
          label: string;
          url: string;
          sort_order: number;
          source: ProjectSource;
          created_at: string;
        };
        Insert: {
          project_id: string;
          type: LinkType;
          label: string;
          url: string;
          sort_order?: number;
          source?: ProjectSource;
        };
        Update: {
          type?: LinkType;
          label?: string;
          url?: string;
          sort_order?: number;
          source?: ProjectSource;
        };
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_log: {
        Row: {
          id: string;
          actor_id: string | null;
          project_id: string | null;
          action_type: string;
          description: string;
          created_at: string;
        };
        Insert: {
          actor_id?: string | null;
          project_id?: string | null;
          action_type: string;
          description: string;
        };
        Update: { description?: string };
        Relationships: [];
      };
    };
    Views: {
      v_category_stats: {
        Row: {
          category: ProjectCategory;
          total: number;
          live: number;
          draft: number;
          video_links: number;
          portfolio_links: number;
        };
        Relationships: [];
      };
      v_portfolio_summary: {
        Row: {
          total_projects: number;
          live_projects: number;
          draft_projects: number;
          total_video_links: number;
          total_portfolio_links: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      project_category: ProjectCategory;
      project_status: ProjectStatus;
      link_type: LinkType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectLink = Database["public"]["Tables"]["project_links"]["Row"];
export type ActivityRow = Database["public"]["Tables"]["activity_log"]["Row"];
export type CategoryStats = Database["public"]["Views"]["v_category_stats"]["Row"];
export type PortfolioSummary = Database["public"]["Views"]["v_portfolio_summary"]["Row"];

/** A project with its links split by type — what the UI actually renders. */
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
