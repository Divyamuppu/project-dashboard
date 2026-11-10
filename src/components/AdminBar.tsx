"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { login, logout, type LoginState } from "@/app/actions/auth";

export function AdminBar({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) return <SignedIn />;
  return <SignedOut />;
}

function SignedIn() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
        Admin
      </span>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await logout();
            router.refresh();
          })
        }
        className="text-sm text-muted hover:text-ink disabled:opacity-50"
      >
        {pending ? "Locking…" : "Lock"}
      </button>
    </div>
  );
}

function SignedOut() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});
  const wrapRef = useRef<HTMLDivElement>(null);

  // Refresh once the server confirms the unlock, so admin controls appear.
  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state.ok, router]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="rounded-md border border-line bg-white px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
      >
        Admin login
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Admin login"
          className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-line bg-white p-3 shadow-lg"
        >
          <form action={formAction} className="space-y-2">
            <label htmlFor="admin-password" className="block text-xs text-muted">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              name="password"
              required
              autoFocus
              autoComplete="current-password"
              aria-invalid={Boolean(state.error)}
              className="w-full rounded border border-line px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none"
            />
            <SubmitButton />
            {state.error && (
              <p role="alert" className="text-xs text-danger">
                {state.error}
              </p>
            )}
          </form>
          <p className="mt-2 text-xs text-muted">
            Unlocks adding and editing on this browser for 30 days.
          </p>
        </div>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-accent px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
    >
      {pending ? "Checking…" : "Unlock"}
    </button>
  );
}
