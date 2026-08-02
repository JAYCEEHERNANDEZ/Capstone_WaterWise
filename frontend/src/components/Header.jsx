import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiDroplet, FiLogOut, FiUser } from "react-icons/fi";

const WORKSPACE_LABELS = {
  admin: "Barangay operations",
  "meter-reader": "Field operations",
  consumer: "Resident portal",
};

export default function Header({
  accountName = "WaterWise User",
  activeRole,
  activeRoleLabel,
  notificationSlot,
  onLogout,
  subtitle = "Sucol Water System",
  title = "WaterWise",
}) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const accountTriggerRef = useRef(null);
  const workspaceLabel = WORKSPACE_LABELS[activeRole] ?? "Water service portal";

  useEffect(() => {
    if (!isAccountOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isAccountOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="flex min-h-16 w-full items-stretch">
        {/* The desktop brand column matches the sidebar width exactly. */}
        <div className="flex min-w-0 shrink-0 items-center gap-3 px-4 sm:px-5 lg:w-64 lg:border-r lg:border-slate-200">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-water-600 text-white shadow-sm">
            <FiDroplet aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              {title}
            </p>
            <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
          {/* Workspace context fills the header without duplicating the page title. */}
          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-water-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{workspaceLabel}</p>
              <p className="truncate text-xs text-slate-500">{activeRoleLabel}</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {notificationSlot}

            {onLogout && (
              <div className="relative" ref={accountMenuRef}>
                <button
                  aria-expanded={isAccountOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  className="flex min-h-13 items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 text-slate-600 shadow-sm transition-colors duration-150 hover:border-water-200 hover:bg-water-50 hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 sm:px-3"
                  onClick={() => setIsAccountOpen((isOpen) => !isOpen)}
                  ref={accountTriggerRef}
                  type="button"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-water-50 text-water-700">
                    <FiUser aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="hidden max-w-40 min-w-0 text-left xl:block">
                    <span className="block truncate text-xs font-bold text-slate-900">{accountName}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{activeRoleLabel}</span>
                  </span>
                  <FiChevronDown
                    aria-hidden="true"
                    className={`hidden h-4 w-4 transition-transform duration-150 sm:block ${isAccountOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isAccountOpen && (
                  <div
                    aria-label="Account actions"
                    className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-raised"
                    role="menu"
                  >
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate text-sm font-bold text-slate-900">{accountName}</p>
                      <p className="mt-1 text-xs font-semibold text-water-600">{activeRoleLabel}</p>
                    </div>
                    <button
                      className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                      onClick={() => {
                        setIsAccountOpen(false);
                        onLogout();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <FiLogOut aria-hidden="true" className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
