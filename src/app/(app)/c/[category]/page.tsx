import { notFound } from "next/navigation";
import { getProjects, getCategoryStats } from "@/lib/queries/portfolio";
import { CATEGORY_MAP, CATEGORIES } from "@/types/database";
import type { ProjectCategory } from "@/types/database";
import { ProjectDialog } from "@/components/ProjectDialog";
import { ProjectCard } from "@/components/ProjectCard";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.key }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!(category in CATEGORY_MAP)) notFound();
  const key = category as ProjectCategory;
  const meta = CATEGORY_MAP[key];

  const [projects, stats, admin] = await Promise.all([
    getProjects(key),
    getCategoryStats(),
    isAdmin(),
  ]);
  const s = stats.find((x) => x.category === key);

  return (
    <main className="px-6 py-6 pb-20">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="h-3 w-3 rounded-sm" style={{ background: meta.hex }} />
          {meta.label}
        </h1>
        {admin && (
          <ProjectDialog
            mode="create"
            defaultCategory={key}
            trigger={
              <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">
                + Add project to {meta.label}
              </button>
            }
          />
        )}
      </div>

      <p className="mb-6 text-sm text-muted tnum">
        {Number(s?.total ?? 0)} project{Number(s?.total ?? 0) === 1 ? "" : "s"} ·{" "}
        {Number(s?.live ?? 0)} live · {Number(s?.draft ?? 0)} draft ·{" "}
        {Number(s?.video_links ?? 0)} video links · {Number(s?.portfolio_links ?? 0)} portfolio links
      </p>

      {projects.length === 0 ? (
        <div className="rounded-md border border-line bg-white py-20 text-center">
          <p className="text-sm text-muted">
            No projects in {meta.label} yet.
          </p>
          {admin && (
            <div className="mt-4">
              <ProjectDialog
                mode="create"
                defaultCategory={key}
                trigger={
                  <button className="rounded-md border border-line bg-white px-4 py-2 text-sm hover:border-accent hover:text-accent">
                    Add the first one
                  </button>
                }
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} canEdit={admin} />
          ))}
        </div>
      )}
    </main>
  );
}
