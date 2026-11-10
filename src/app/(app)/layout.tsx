import { getCategoryStats } from "@/lib/queries/portfolio";
import { Sidebar } from "@/components/Sidebar";
import { AdminBar } from "@/components/AdminBar";
import { isAdmin } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [stats, admin] = await Promise.all([getCategoryStats(), isAdmin()]);
  const total = stats.reduce((n, s) => n + Number(s.total), 0);

  return (
    <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
      <Sidebar stats={stats} total={total} />
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-end border-b border-line bg-paper px-6 py-2.5">
          <AdminBar isAdmin={admin} />
        </header>
        {children}
      </div>
    </div>
  );
}
