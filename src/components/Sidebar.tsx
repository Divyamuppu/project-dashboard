import Link from "next/link";
import { CATEGORIES } from "@/types/database";
import type { CategoryStats } from "@/types/database";

export function Sidebar({
  stats,
  active,
  total,
}: {
  stats: CategoryStats[];
  active?: string;
  total: number;
}) {
  const countFor = (key: string) => stats.find((s) => s.category === key)?.total ?? 0;

  return (
    <aside className="flex flex-col bg-sidebar text-[#C7D2CE] md:sticky md:top-0 md:h-screen">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="font-semibold text-white">a-tom Collective</div>
        <div className="text-[11px] text-white/50">Portfolio dashboard</div>
      </div>
      <nav className="flex flex-row gap-1 overflow-x-auto p-2.5 md:flex-col">
        <NavLink href="/" label="Dashboard" count={total} active={!active} />
        {CATEGORIES.map((c) => (
          <NavLink
            key={c.key}
            href={`/c/${c.key}`}
            label={c.label}
            count={countFor(c.key)}
            active={active === c.key}
            dot={c.hex}
          />
        ))}
      </nav>
    </aside>
  );
}

function NavLink({
  href, label, count, active, dot,
}: { href: string; label: string; count: number; active: boolean; dot?: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-[13.5px] transition ${
        active ? "bg-accent-soft font-medium text-accent" : "hover:bg-white/5 hover:text-white"
      }`}
    >
      {dot ? (
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: dot }} />
      ) : (
        <span className="w-2.5 shrink-0 text-center">◧</span>
      )}
      {label}
      <span
        className={`ml-auto rounded-full px-1.5 text-[11px] tnum ${
          active ? "bg-accent text-white" : "bg-white/10 text-white"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}
