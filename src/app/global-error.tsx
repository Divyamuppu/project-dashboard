"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary.
 *
 * The one inside the (app) route group can't catch a throw from that group's
 * own layout — a layout's error bubbles past its sibling boundary. Since the
 * layout loads data on every request, a database problem would otherwise show
 * visitors a bare Next.js error page with a digest and nothing else.
 *
 * This replaces the whole document, so it carries its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4F6F5",
          color: "#15191C",
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif",
          padding: "0 16px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            The portfolio is temporarily unavailable
          </h1>
          <p style={{ fontSize: 14, color: "#5B6560", marginTop: 8, lineHeight: 1.5 }}>
            It couldn&apos;t reach its database. This is usually brief — try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              background: "#1F5A52",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              padding: "9px 18px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#5B6560", marginTop: 16 }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
