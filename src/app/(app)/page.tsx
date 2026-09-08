import { Suspense } from "react";
import Link from "next/link";
import {
  getSummary, getCategoryStats, getActivity, searchProjects, getProjects,
} from "@/lib/queries/portfolio";
import { CATEGORIES } from "@/types/database";
import { ProjectDialog } from "@/components/ProjectDialog";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searching = Boolean(q?.trim());

  const [summary, stats, activity] = await Promise.all([
    getSummary(), getCategoryStats(), getActivity(),
  ]);

  const results = searching ? await searchProjects(q!) : [];
  const recent = searching ? [] : (await getProjects()).slice(0, 4);

  return (
    <main className="px-6 py-6 pb-20">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <ProjectDialog
          mode="create"
          trigger={
            <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">
              + Add project
            </button>
          }
        />
      </div>

      <Suspense fallback={<div className="h-[46px] rounded-md border border-line bg-white" />}>
        <SearchBar initial={q ?? ""} />
      </Suspense>

      {searching ? (
        <section className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
          </p>
          {results.length === 0 ? (
            <div className="rounded-md border border-line bg-white py-16 text-center text-sm text-muted">
              Nothing matches “{q}”. Try a project name, client, link label, or part of a URL.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Live projects" value={summary.live_projects} accent="#1F7A4D" />
            <Tile label="Total projects" value={summary.total_projects} accent="#1F5A52" />
            <Tile label="Video links" value={summary.total_video_links} accent="#B5257E" />
            <Tile label="Portfolio links" value={summary.total_portfolio_links} accent="#7C4FC9" />
          </div>

          <section className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
              Projects by category
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CATEGORIES.map((c) => {
                const s = stats.find((x) => x.category === c.key);
                return (
                  <Link
                    key={c.key}
                    href={`/c/${c.key}`}
                    className="rounded-md border border-line bg-white p-4 transition hover:shadow-sm"
                    style={{ borderTop: `3px solid ${c.hex}` }}
                  >
                    <div className="font-semibold">{c.label}</div>
                    <div className="mt-2 text-2xl font-medium tnum">{Number(s?.total ?? 0)}</div>
                    <div className="mt-1 text-xs text-muted">
                      <span className="font-semibold text-live">{Number(s?.live ?? 0)} live</span>
                      {" · "}{Number(s?.draft ?? 0)} draft
                    </div>
                    <div className="mt-2 text-xs text-muted tnum">
                      {Number(s?.video_links ?? 0)} video · {Number(s?.portfolio_links ?? 0)} portfolio
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-md border border-line bg-white">
              <div className="border-b border-line px-4 py-3 text-[13px] font-semibold">
                Live activity
              </div>
              {activity.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">Nothing yet.</p>
              ) : (
                <ul>
                  {activity.map((a) => (
                    <li key={a.id} className="flex gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0">
                      <span className="text-live">✓</span>
                      <span className="flex-1">{a.description}</span>
                      <span className="whitespace-nowrap text-xs text-muted">
                        {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
                Recently added
              </p>
              <div className="grid gap-4">
                {recent.length === 0 ? (
                  <div className="rounded-md border border-line bg-white py-12 text-center text-sm text-muted">
                    No projects yet. Use “Add project” to create the first one.
                  </div>
                ) : (
                  recent.map((p) => <ProjectCard key={p.id} project={p} />)
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Tile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4" style={{ borderTop: `2px solid ${accent}` }}>
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-3xl font-medium tnum">{Number(value)}</div>
    </div>
  );
}
