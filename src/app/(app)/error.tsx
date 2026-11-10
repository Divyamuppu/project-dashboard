"use client";

import { useEffect } from "react";

/**
 * Catches a failed data load (database unreachable, bad credentials) so a
 * visitor sees something explicable rather than a blank error page.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">Couldn&apos;t load the portfolio</h1>
        <p className="mt-2 text-sm text-muted">
          The dashboard couldn&apos;t reach its database. This is usually temporary.
        </p>
        <button
          onClick={reset}
          className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
        {error.digest && (
          <p className="mt-4 text-xs text-muted">Reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
