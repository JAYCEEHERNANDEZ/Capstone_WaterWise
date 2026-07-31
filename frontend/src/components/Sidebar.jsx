import { useState } from "react";
import { FiMoreHorizontal, FiX } from "react-icons/fi";
import { NavLink } from "react-router";

function getItemLabel(item) {
  return typeof item === "string" ? item : item.label;
}

function NavigationLink({ compact, item, mobile = false, onNavigate }) {
  const label = getItemLabel(item);
  const Icon = typeof item === "string" ? null : item.Icon;
  const sharedClass = mobile
    ? "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-center text-[11px] font-bold transition"
    : `relative flex min-h-11 items-center justify-start rounded-xl px-3 text-left text-sm font-bold transition ${compact ? "lg:gap-2.5 lg:py-2" : "lg:gap-3 lg:py-2"}`;

  if (typeof item === "string" || !item.path) {
    return (
      <span className={`${sharedClass} text-slate-500`}>
        {Icon && <Icon aria-hidden="true" className={mobile ? "h-5 w-5" : "h-4 w-4 shrink-0 text-sky-600"} />}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <NavLink
      className={({ isActive }) =>
        [
          sharedClass,
          isActive
            ? mobile
              ? "bg-sky-50 text-sky-700 before:absolute before:-top-2 before:h-1 before:w-8 before:rounded-full before:bg-sky-600"
              : "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-100 before:absolute before:left-0 before:h-6 before:w-1 before:rounded-r-full before:bg-sky-600"
            : "text-slate-500 hover:bg-sky-50/70 hover:text-slate-900",
        ].join(" ")
      }
      onClick={onNavigate}
      to={item.path}
    >
      {Icon && <Icon aria-hidden="true" className={mobile ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"} />}
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({
  activeRoleLabel,
  items = [],
  compact = false,
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primaryMobileItems = items.length > 4 ? items.slice(0, 3) : items;
  const additionalMobileItems = items.length > 4 ? items.slice(3) : [];

  return (
    <>
      {isMoreOpen && (
        <button
          aria-label="Close more navigation"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsMoreOpen(false)}
          type="button"
        />
      )}

      <aside className={`ww-glass-strong fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 border-t border-white/70 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_rgba(15,74,110,0.1)] lg:sticky lg:shrink-0 lg:self-start lg:border-y-0 lg:border-l-0 lg:border-r lg:pb-0 lg:shadow-none ${compact ? "lg:top-16 lg:h-[calc(100vh-64px)] lg:w-60 xl:w-64" : "lg:top-[72px] lg:h-[calc(100vh-72px)] lg:w-64 xl:w-72"}`}>
        {additionalMobileItems.length > 0 && (
          <div
            className={[
              "ww-glass-strong absolute inset-x-3 bottom-[calc(100%+0.75rem)] grid max-h-[min(65vh,32rem)] gap-1 overflow-y-auto rounded-[20px] p-3 transition duration-200 lg:hidden",
              isMoreOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
            ].join(" ")}
          >
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <div>
                <p className="text-sm font-extrabold text-slate-900">More tools</p>
                <p className="text-xs text-slate-500">{activeRoleLabel} workspace</p>
              </div>
              <button
                aria-label="Close more tools"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-sky-50"
                onClick={() => setIsMoreOpen(false)}
                type="button"
              >
                <FiX aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            {additionalMobileItems.map((item) => (
              <NavigationLink item={item} key={getItemLabel(item)} onNavigate={() => setIsMoreOpen(false)} />
            ))}
          </div>
        )}

        <div className={`flex h-full items-center gap-2 px-2 py-2 lg:flex-col lg:items-stretch ${compact ? "lg:px-4 lg:py-5" : "lg:p-5"}`}>
          <nav className="hidden min-w-0 flex-1 overflow-y-auto lg:block" aria-label={`${activeRoleLabel ?? "WaterWise"} navigation`}>
            <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </p>
            <ul className="grid min-w-0 gap-1">
              {items.map((item) => (
                <li key={getItemLabel(item)}>
                  <NavigationLink compact={compact} item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <nav className="flex min-w-0 flex-1 lg:hidden" aria-label={`${activeRoleLabel ?? "WaterWise"} mobile navigation`}>
            {primaryMobileItems.map((item) => (
              <NavigationLink item={item} key={getItemLabel(item)} mobile />
            ))}
            {additionalMobileItems.length > 0 && (
              <button
                aria-expanded={isMoreOpen}
                className={[
                  "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-center text-[11px] font-bold transition",
                  isMoreOpen ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-sky-50 hover:text-slate-900",
                ].join(" ")}
                onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
                type="button"
              >
                <FiMoreHorizontal aria-hidden="true" className="h-5 w-5" />
                More
              </button>
            )}
          </nav>

        
        </div>
      </aside>
    </>
  );
}
