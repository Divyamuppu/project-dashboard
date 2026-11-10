"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createProject, updateProject, type LinkInput } from "@/app/actions/projects";
import { CATEGORIES } from "@/types/database";
import type { ProjectCategory, ProjectStatus, ProjectWithLinks } from "@/types/database";

type Row = { key: string; id?: string; label: string; url: string };

const newRow = (): Row => ({ key: Math.random().toString(36).slice(2), label: "", url: "" });

function toRows(links: { id: string; label: string; url: string }[]): Row[] {
  if (!links.length) return [newRow()];
  return links.map((l) => ({ key: l.id, id: l.id, label: l.label, url: l.url }));
}

export function ProjectDialog({
  mode,
  project,
  defaultCategory,
  trigger,
}: {
  mode: "create" | "edit";
  project?: ProjectWithLinks;
  defaultCategory?: ProjectCategory;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(project?.name ?? "");
  const [client, setClient] = useState(project?.client ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState<ProjectCategory>(
    project?.category ?? defaultCategory ?? "social"
  );
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "draft");
  const [projectDate, setProjectDate] = useState(project?.project_date ?? "");
  const [videoRows, setVideoRows] = useState<Row[]>(toRows(project?.videoLinks ?? []));
  const [portfolioRows, setPortfolioRows] = useState<Row[]>(toRows(project?.portfolioLinks ?? []));

  const dialogRef = useRef<HTMLDivElement>(null);

  // reset the form each time a create dialog is opened
  useEffect(() => {
    if (!open || mode !== "create") return;
    setName(""); setClient(""); setDescription("");
    setCategory(defaultCategory ?? "social");
    setStatus("draft");
    setProjectDate("");
    setVideoRows([newRow()]); setPortfolioRows([newRow()]);
    setError("");
  }, [open, mode, defaultCategory]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function submit() {
    setError("");
    const links: LinkInput[] = [
      ...videoRows.map((r) => ({ id: r.id, type: "video" as const, label: r.label, url: r.url })),
      ...portfolioRows.map((r) => ({ id: r.id, type: "portfolio" as const, label: r.label, url: r.url })),
    ];

    startTransition(async () => {
      const payload = { category, name, client, description, status, projectDate, links };
      const result =
        mode === "create"
          ? await createProject(payload)
          : await updateProject({ ...payload, id: project!.id });

      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:p-8"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={mode === "create" ? "Add project" : "Edit project"}
            className="w-full max-w-2xl rounded-lg border border-line bg-white shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-sm font-semibold">
                {mode === "create" ? "Add project" : "Edit project"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-ink" aria-label="Close">✕</button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Project name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Diwali Reels Series"
                    className={inputCls}
                    autoFocus
                  />
                </Field>
                <Field label="Client (optional)">
                  <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Zomato" className={inputCls} />
                </Field>
                <Field label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value as ProjectCategory)} className={inputCls}>
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={inputCls}>
                    <option value="draft">Draft</option>
                    <option value="live">Live</option>
                  </select>
                </Field>
                <Field label="Project date (optional)">
                  <input
                    type="date"
                    value={projectDate}
                    onChange={(e) => setProjectDate(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Description (optional)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="One line about the project"
                  className={inputCls}
                />
              </Field>

              <LinkRows title="Video links" rows={videoRows} setRows={setVideoRows} placeholder="https://youtube.com/…" />
              <LinkRows title="Portfolio links" rows={portfolioRows} setRows={setPortfolioRows} placeholder="https://behance.net/…" />

              {error && <p className="text-sm text-danger">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
              <button onClick={() => setOpen(false)} className="rounded border border-line px-3 py-1.5 text-sm hover:border-muted">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={pending}
                className="rounded bg-accent px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending ? "Saving…" : mode === "create" ? "Add project" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputCls =
  "w-full rounded border border-line bg-white px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

function LinkRows({
  title,
  rows,
  setRows,
  placeholder,
}: {
  title: string;
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  placeholder: string;
}) {
  const update = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const remove = (key: string) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : [newRow()]));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{title}</span>
        <span className="text-xs text-muted">{rows.filter((r) => r.url.trim()).length} added</span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="flex gap-2">
            <input
              value={row.label}
              onChange={(e) => update(row.key, { label: e.target.value })}
              placeholder="Label (optional)"
              className={`${inputCls} max-w-[36%]`}
            />
            <input
              value={row.url}
              onChange={(e) => update(row.key, { url: e.target.value })}
              placeholder={placeholder}
              className={inputCls}
            />
            <button
              onClick={() => remove(row.key)}
              className="shrink-0 rounded border border-line px-2.5 text-muted hover:border-danger hover:text-danger"
              aria-label="Remove link"
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((rs) => [...rs, newRow()])}
        className="mt-2 text-xs font-medium text-accent hover:underline"
      >
        + Add another {title.toLowerCase().replace(" links", "")} link
      </button>
    </div>
  );
}
