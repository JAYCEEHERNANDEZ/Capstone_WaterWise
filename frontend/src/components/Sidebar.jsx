import { useEffect, useRef, useState } from "react";
import { FiMoreHorizontal, FiX } from "react-icons/fi";
import { NavLink } from "react-router";

function getItemLabel(item) {
  return typeof item === "string" ? item : item.label;
}

function NavigationLink({ item, mobile = false, onNavigate }) {
  const label = getItemLabel(item);
  const Icon = typeof item === "string" ? null : item.Icon;
  const baseClass = mobile
    ? "relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-center text-[11px] font-bold transition-colors duration-150"
    : "relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors duration-150";

  if (typeof item === "string" || !item.path) {
    return (
      <span className={`${baseClass} text-slate-500`}>
        {Icon && <Icon aria-hidden="true" className={mobile ? "h-5 w-5" : "h-4 w-4 shrink-0 text-water-600"} />}
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <NavLink
      className={({ isActive }) => [
        baseClass,
        isActive
          ? mobile
            ? "bg-water-50 text-water-700 after:absolute after:-top-2 after:h-1 after:w-8 after:rounded-full after:bg-water-600"
            : "bg-water-50 text-water-800 before:absolute before:left-0 before:h-6 before:w-1 before:rounded-r-full before:bg-water-600"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
      ].join(" ")}
      onClick={onNavigate}
      to={item.path}
    >
      {Icon && <Icon aria-hidden="true" className={mobile ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"} />}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ activeRoleLabel, items = [] }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const moreTriggerRef = useRef(null);
  const primaryMobileItems = items.length > 4 ? items.slice(0, 3) : items;
  const additionalMobileItems = items.length > 4 ? items.slice(3) : [];

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    const moreTrigger = moreTriggerRef.current;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      moreTrigger?.focus();
    };
  }, [isMoreOpen]);

  return (
    <>
      {isMoreOpen && (
        <button
          aria-label="Close more navigation"
          className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden"
          onClick={() => setIsMoreOpen(false)}
          type="button"
        />
      )}

      {/* Desktop sidebar becomes a solid mobile bottom dock below lg. */}
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:w-64 lg:shrink-0 lg:self-start lg:border-r lg:border-t-0 lg:shadow-none">
        {additionalMobileItems.length > 0 && (
          <div
            aria-hidden={!isMoreOpen}
            aria-label="More navigation tools"
            aria-modal="true"
            className={[
              "absolute inset-x-3 bottom-[calc(100%+0.75rem)] grid max-h-[min(65vh,32rem)] gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-modal transition duration-200 lg:hidden",
              isMoreOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
            ].join(" ")}
            id="mobile-more-navigation"
            inert={!isMoreOpen}
            role="dialog"
          >
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <div>
                <p className="text-sm font-extrabold text-slate-900">More tools</p>
                <p className="text-xs text-slate-500">{activeRoleLabel} workspace</p>
              </div>
              <button
                aria-label="Close more tools"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-600 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600"
                onClick={() => setIsMoreOpen(false)}
                ref={closeButtonRef}
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

        <div className="flex h-full items-center gap-2 px-2 py-2 lg:flex-col lg:items-stretch lg:px-4 lg:py-5">
          <nav className="hidden min-w-0 flex-1 overflow-y-auto lg:block" aria-label={`${activeRoleLabel ?? "WaterWise"} navigation`}>
            <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </p>
            <ul className="grid min-w-0 gap-1">
              {items.map((item) => (
                <li key={getItemLabel(item)}>
                  <NavigationLink item={item} />
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
                aria-controls="mobile-more-navigation"
                aria-expanded={isMoreOpen}
                aria-haspopup="dialog"
                className={`relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-center text-[11px] font-bold transition-colors duration-150 ${isMoreOpen ? "bg-water-50 text-water-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
                ref={moreTriggerRef}
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
