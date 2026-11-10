"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => { setValue(params.get("q") ?? ""); }, [params]);

  function submit(next: string) {
    const qs = new URLSearchParams();
    if (next.trim()) qs.set("q", next.trim());
    startTransition(() => router.push(qs.toString() ? `/?${qs}` : "/"));
  }

  return (
    <div className="flex gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") submit(value); }}
        placeholder="Search projects, clients, link labels or URLs…"
        className="flex-1 rounded-md border border-line bg-white px-4 py-2.5 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <button
        onClick={() => submit(value)}
        disabled={pending}
        className="rounded-md bg-accent px-5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Searching…" : "Search"}
      </button>
      {params.get("q") && (
        <button
          onClick={() => { setValue(""); submit(""); }}
          className="rounded-md border border-line px-4 text-sm text-muted hover:text-ink"
        >
          Clear
        </button>
      )}
    </div>
  );
}
