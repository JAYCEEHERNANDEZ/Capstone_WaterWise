import { FiUser } from "react-icons/fi";
import { NavLink } from "react-router";

function getItemLabel(item) {
  return typeof item === "string" ? item : item.label;
}

export default function Sidebar({
  activeRoleLabel,
  items = [],
  userName = "WaterWise User",
  compact = false,
}) {
  return (
    <aside className={`fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:sticky lg:shrink-0 lg:border-r lg:border-t-0 lg:shadow-none ${compact ? "lg:top-16 lg:h-[calc(100vh-64px)] lg:w-52 xl:w-56" : "lg:top-[72px] lg:h-[calc(100vh-72px)] lg:w-64 xl:w-72"}`}>
      <div className={`flex h-full items-center gap-2 px-2 py-2 lg:flex-col lg:items-stretch ${compact ? "lg:p-3" : "lg:p-5"}`}>
        <nav className="min-w-0 flex-1 overflow-x-auto lg:overflow-visible" aria-label={`${activeRoleLabel ?? "WaterWise"} navigation`}>
          <ul className="flex min-w-max items-stretch gap-1 lg:grid lg:min-w-0 lg:gap-1.5">
            {items.map((item) => {
              const label = getItemLabel(item);
              const Icon = typeof item === "string" ? null : item.Icon;

              return (
                <li className="min-w-[76px] flex-1 lg:min-w-0" key={label}>
                  {typeof item === "string" || !item.path ? (
                    <span className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-center text-[11px] font-bold text-slate-500 lg:min-h-12 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2 lg:text-left lg:text-sm">
                      {Icon && (
                        <Icon
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 text-[#0284C7] lg:h-4 lg:w-4"
                        />
                      )}
                      {label}
                    </span>
                  ) : (
                    <NavLink
                      className={({ isActive }) =>
                        [
                          `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-center text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:ring-offset-2 lg:flex-row lg:justify-start lg:px-3 lg:text-left lg:text-sm ${compact ? "lg:min-h-10 lg:gap-2 lg:py-1.5" : "lg:min-h-12 lg:gap-3 lg:py-2"}`,
                          isActive
                            ? "bg-sky-50 text-[#0284C7] lg:bg-[#0F172A] lg:text-white"
                            : "text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]",
                        ].join(" ")
                      }
                      to={item.path}
                    >
                      {Icon && (
                        <Icon
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 lg:h-4 lg:w-4"
                        />
                      )}
                      <span>{label}</span>
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden shrink-0 lg:mt-auto lg:block lg:w-full lg:border-t lg:border-slate-200 lg:pt-4">
          <div className="flex items-center gap-3 rounded-xl lg:bg-slate-50 lg:p-3">
            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0284C7] shadow-sm lg:flex">
              <FiUser aria-hidden="true" className="h-4 w-4" />
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-bold tracking-[-0.02em] text-[#0F172A]">
                {userName}
              </p>
              {activeRoleLabel && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0284C7]">
                  {activeRoleLabel}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
