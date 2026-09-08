"use client";

import { useState, useTransition } from "react";
import { addLink, deleteLink, deleteProject, setProjectStatus } from "@/app/actions/projects";
import { CATEGORY_MAP } from "@/types/database";
import type { LinkType, ProjectLink, ProjectWithLinks } from "@/types/database";
import { ProjectDialog } from "./ProjectDialog";

export function ProjectCard({ project }: { project: ProjectWithLinks }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<LinkType | null>(null);
  const cat = CATEGORY_MAP[project.category];

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError("");
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="flex flex-col rounded-lg border border-line bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{project.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="rounded-full px-2 py-0.5 text-white" style={{ background: cat.hex }}>
              {cat.label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 ${
                project.status === "live" ? "bg-live/15 text-live" : "bg-draft/20 text-muted"
              }`}
            >
              {project.status === "live" ? "Live" : "Draft"}
            </span>
            {project.client && <span>· {project.client}</span>}
          </div>
          {project.description && (
            <p className="mt-2 text-sm text-muted">{project.description}</p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 px-4 py-3">
        <LinkSection
          title="Video links"
          links={project.videoLinks}
          emptyText="No video links yet"
          onDelete={(id) => run(() => deleteLink(id))}
          pending={pending}
        />
        <LinkSection
          title="Portfolio links"
          links={project.portfolioLinks}
          emptyText="No portfolio links yet"
          onDelete={(id) => run(() => deleteLink(id))}
          pending={pending}
        />

        {adding && (
          <QuickAdd
            type={adding}
            pending={pending}
            onCancel={() => setAdding(null)}
            onSave={(label, url) =>
              run(async () => {
                const r = await addLink({ projectId: project.id, type: adding, label, url });
                if (r.ok) setAdding(null);
                return r;
              })
            }
          />
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
        <button onClick={() => setAdding("video")} className={btnCls} disabled={pending}>
          + Video link
        </button>
        <button onClick={() => setAdding("portfolio")} className={btnCls} disabled={pending}>
          + Portfolio link
        </button>
        <span className="flex-1" />
        <ProjectDialog
          mode="edit"
          project={project}
          trigger={<button className={btnCls}>Edit</button>}
        />
        <button
          className={btnCls}
          disabled={pending}
          onClick={() =>
            run(() => setProjectStatus(project.id, project.status === "live" ? "draft" : "live"))
          }
        >
          {project.status === "live" ? "Mark draft" : "Mark live"}
        </button>
        <button
          className={`${btnCls} hover:border-danger hover:text-danger`}
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete "${project.name}" and all its links? This can't be undone.`)) return;
            run(() => deleteProject(project.id));
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

const btnCls =
  "rounded border border-line bg-white px-2.5 py-1 text-xs hover:border-accent hover:text-accent disabled:opacity-50";

function LinkSection({
  title,
  links,
  emptyText,
  onDelete,
  pending,
}: {
  title: string;
  links: ProjectLink[];
  emptyText: string;
  onDelete: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
        {title} {links.length > 0 && <span className="tnum">({links.length})</span>}
      </div>
      {links.length === 0 ? (
        <p className="text-sm italic text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {links.map((l) => (
            <li key={l.id} className="group flex items-center gap-2">
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-accent hover:underline"
                title={l.url}
              >
                {l.label}
              </a>
              <button
                onClick={() => {
                  if (!confirm(`Remove "${l.label}"?`)) return;
                  onDelete(l.id);
                }}
                disabled={pending}
                className="ml-auto shrink-0 text-muted opacity-0 transition group-hover:opacity-100 hover:text-danger focus:opacity-100"
                aria-label={`Remove ${l.label}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuickAdd({
  type,
  pending,
  onSave,
  onCancel,
}: {
  type: LinkType;
  pending: boolean;
  onSave: (label: string, url: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  return (
    <div className="flex flex-wrap gap-2 border-t border-dashed border-line pt-3">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (optional)"
        className="max-w-[36%] flex-1 rounded border border-line px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && url.trim()) onSave(label, url); }}
        placeholder={type === "video" ? "https://youtube.com/…" : "https://behance.net/…"}
        className="flex-1 rounded border border-line px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none"
        autoFocus
      />
      <button
        onClick={() => onSave(label, url)}
        disabled={pending || !url.trim()}
        className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        Add
      </button>
      <button onClick={onCancel} className="rounded border border-line px-3 py-1.5 text-xs">
        Cancel
      </button>
    </div>
  );
}
