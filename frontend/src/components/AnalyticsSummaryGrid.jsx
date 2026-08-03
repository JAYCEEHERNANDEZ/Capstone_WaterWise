import { Droplets, Gauge, Sigma, TrendingUp } from "lucide-react";

const number = (value) =>
  Number(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 1 });

function SummaryCard({ Icon, description, label, testId, unit = "m³", value }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-card sm:p-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700 sm:h-10 sm:w-10">
          <Icon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <h2 className="min-w-0 text-xs font-bold leading-4 text-slate-600 sm:text-sm">{label}</h2>
      </div>
      <p className="mt-3 font-mono text-xl font-extrabold tracking-tight text-navy-900 tabular-nums sm:mt-5 sm:text-3xl" data-testid={testId}>
        {value}
        {unit && <span className="ml-1 text-[10px] font-bold text-slate-500 sm:text-sm">{unit}</span>}
      </p>
      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:mt-2 sm:text-xs">{description}</p>
    </article>
  );
}

export default function AnalyticsSummaryGrid({ consumptionHistory = [] }) {
  const totalConsumption = consumptionHistory.reduce(
    (total, record) => total + Number(record.volume ?? 0),
    0,
  );
  const averageUsage = consumptionHistory.length
    ? totalConsumption / consumptionHistory.length
    : 0;
  const latestRecord = consumptionHistory.at(-1) ?? null;
  const highestRecord = consumptionHistory.length
    ? consumptionHistory.reduce((highest, record) =>
        Number(record.volume) > Number(highest.volume) ? record : highest,
      )
    : null;

  return (
    <section
      aria-label="Consumption summary"
      className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4"
      data-testid={consumptionHistory.length ? "analytics-grid" : "analytics-empty"}
    >
      <SummaryCard
        Icon={Droplets}
        description={latestRecord?.month ?? "No recorded month"}
        label="Latest water use"
        testId="stat-latest"
        value={number(latestRecord?.volume)}
      />
      <SummaryCard
        Icon={Gauge}
        description="Typical use per recorded month"
        label="Monthly average"
        testId="stat-avg"
        value={number(averageUsage)}
      />
      <SummaryCard
        Icon={Sigma}
        description={`${consumptionHistory.length} recorded month${consumptionHistory.length === 1 ? "" : "s"}`}
        label="Total for period"
        testId="stat-total"
        value={number(totalConsumption)}
      />
      <SummaryCard
        Icon={TrendingUp}
        description={highestRecord?.month ?? "No recorded month"}
        label="Highest-use month"
        testId="stat-highest"
        value={number(highestRecord?.volume)}
      />
    </section>
  );
}
