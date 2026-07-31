import { FiCalendar, FiFileText } from "react-icons/fi";

export default function CurrentBillingCard({ outstandingBalance = 0, dueDate = "" }) {
  return (
    <section
      className="ww-page-header p-5 text-white sm:p-7"
      data-testid="current-billing-card"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FiFileText aria-hidden="true" className="h-4 w-4 text-water-300" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-water-300">
              Amount due
            </span>
          </div>
          <h2
            className="ww-data-value mt-3 font-mono text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl"
            data-testid="outstanding-balance"
          >
            ₱{outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-navy-900 p-4 sm:min-w-60">
          <div className="flex items-center gap-2">
            <FiCalendar aria-hidden="true" className="h-4 w-4 text-water-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
              Due date
            </span>
          </div>
          <p
            className="mt-2 text-base font-bold tracking-[-0.02em] text-white"
            data-testid="due-date"
          >
            {dueDate || "No pending due date"}
          </p>
        </div>
      </div>
    </section>
  );
}
