export default function MonthlyConsumptionWidget({ month = "N/A", usage = 0 }) {
  return (
    <section className="ww-glass flex min-h-44 flex-col justify-between rounded-[20px] p-5 sm:p-6">
      <div>
        <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#0284C7]">
          Water used this month
        </h3>
        <p className="text-sm text-slate-600">Your latest recorded usage</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
        <div>
          <span className="block text-xs font-semibold text-slate-500">
            Billing period
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
