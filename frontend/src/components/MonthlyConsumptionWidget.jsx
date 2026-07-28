export default function MonthlyConsumptionWidget({ month = "N/A", usage = 0 }) {
  return (
    <section className="flex min-h-44 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_16px_48px_rgba(15,23,42,0.06)] sm:p-6">
      <div>
        <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#0284C7]">
          Monthly Consumption
        </h3>
        <p className="text-sm text-slate-600">Latest volume metrics</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <span className="block text-xs font-semibold text-slate-500">
            Billing Period
          </span>
          <span
            className="mt-1 block text-sm font-bold text-[#0F172A]"
            data-testid="consumption-month"
          >
            {month}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-xs font-semibold text-slate-500">
            Usage
          </span>
          <span
            className="mt-1 block font-mono text-xl font-bold tracking-normal text-[#0284C7]"
            data-testid="consumption-usage"
          >
            {usage} m³
          </span>
        </div>
      </div>
    </section>
  );
}
