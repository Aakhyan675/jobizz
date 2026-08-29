import { NavLink, Outlet } from "react-router-dom";
import { clsx } from "clsx";

export function DashboardShell({ items }: { items: { to: string; label: string; end?: boolean }[] }) {
  return (
    <div className="container-page grid gap-6 py-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx("block rounded-xl px-3 py-2 text-sm font-medium", isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
