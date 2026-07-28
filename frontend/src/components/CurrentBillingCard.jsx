import { FiCalendar, FiFileText } from "react-icons/fi";

export default function CurrentBillingCard({ outstandingBalance = 0, dueDate = "" }) {
  return (
    <section
      className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-slate-900 to-sky-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)] sm:p-7"
      data-testid="current-billing-card"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FiFileText aria-hidden="true" className="h-4 w-4 text-sky-300" />
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
              Outstanding Balance
            </span>
          </div>
          <h2
            className="mt-3 font-mono text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl"
            data-testid="outstanding-balance"
          >
            ₱{outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:min-w-60">
          <div className="flex items-center gap-2">
            <FiCalendar aria-hidden="true" className="h-4 w-4 text-sky-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
              Upcoming Due Date
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
