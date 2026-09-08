import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "a-tom Portfolio Dashboard",
  description: "All a-tom Collective work, organised by vertical.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
