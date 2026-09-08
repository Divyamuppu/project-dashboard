import { getCategoryStats } from "@/lib/queries/portfolio";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const stats = await getCategoryStats();
  const total = stats.reduce((n, s) => n + Number(s.total), 0);

  return (
    <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
      <Sidebar stats={stats} total={total} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
