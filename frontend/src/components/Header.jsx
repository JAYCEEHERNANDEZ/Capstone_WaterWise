import { useState } from "react";
import { FiChevronDown, FiDroplet, FiLogOut, FiUser } from "react-icons/fi";

export default function Header({
  accountName = "WaterWise User",
  activeRole,
  activeRoleLabel,
  notificationSlot,
  onLogout,
  subtitle = "Sucol Water System",
  title = "WaterWise",
  compact = false,
}) {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const workspaceLabel = {
    admin: "Barangay operations",
    "meter-reader": "Field operations",
    consumer: "Resident portal",
  }[activeRole] ?? "Water service portal";

  return (
    <header className="ww-glass-strong sticky top-0 z-30 border-x-0 border-t-0 border-b border-white/70 shadow-[0_8px_28px_rgba(15,74,110,0.08)]">
      <div className={`flex w-full items-stretch ${compact ? "min-h-16" : "min-h-16 sm:min-h-[72px]"}`}>
        <div className={`flex min-w-0 shrink-0 items-center gap-3 px-4 sm:px-5 lg:border-r lg:border-slate-200/70 ${compact ? "lg:w-60 xl:w-64" : "lg:w-64 xl:w-72"}`}>
          <div className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-600 text-white shadow-[0_8px_22px_rgba(2,132,184,0.25)] ${compact ? "h-9 w-9 rounded-xl" : "h-10 w-10 rounded-[14px]"}`}>
            <FiDroplet aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-[-0.03em] text-slate-900 sm:text-lg">
              {title}
            </h1>
            <p className="hidden text-xs font-medium text-slate-500 sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">
          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_0_5px_rgba(103,232,211,0.16)]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{workspaceLabel}</p>
              <p className="truncate text-xs text-slate-500">Sucol Water System</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {notificationSlot}
            {onLogout && (
              <div className="relative">
              <button
                aria-expanded={isAccountOpen}
                aria-label="Open account menu"
                className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/75 px-2 text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-white hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 sm:px-3"
                onClick={() => setIsAccountOpen((isOpen) => !isOpen)}
                type="button"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <FiUser aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="hidden max-w-40 min-w-0 text-left xl:block">
                  <span className="block truncate text-xs font-bold text-slate-900">{accountName}</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{activeRoleLabel}</span>
                </span>
                <FiChevronDown aria-hidden="true" className={`hidden h-4 w-4 transition sm:block ${isAccountOpen ? "rotate-180" : ""}`} />
              </button>

              {isAccountOpen && (
                <div className="ww-glass-strong absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 rounded-2xl p-2 shadow-[0_20px_60px_rgba(8,32,50,0.16)]">
                  <div className="border-b border-slate-100 px-3 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">{accountName}</p>
                    <p className="mt-1 text-xs font-semibold text-sky-600">{activeRoleLabel}</p>
                  </div>
                  <button
                    className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    onClick={onLogout}
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
