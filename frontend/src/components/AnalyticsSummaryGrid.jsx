import CurrentBalanceCard from "./CurrentBalanceCard";

const summaryCards = [
  { key: "total", label: "Total Consumption", testId: "stat-total" },
  { key: "average", label: "Average Monthly Usage", testId: "stat-avg" },
  { key: "highest", label: "Highest Consumption Month", testId: "stat-highest" },
];

export default function AnalyticsSummaryGrid({ amountDue = 0, consumptionHistory = [] }) {
  if (consumptionHistory.length === 0) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
        data-testid="analytics-empty"
      >
        <CurrentBalanceCard amountDue={amountDue} />
        <SummaryCard label="Total Consumption" testId="stat-total" value="0 m³" />
        <SummaryCard label="Average Monthly Usage" testId="stat-avg" value="0 m³" />
        <SummaryCard label="Highest Consumption Month" testId="stat-highest" value="None" />
      </div>
    );
  }

  const totalConsumption = consumptionHistory.reduce((acc, curr) => acc + curr.volume, 0);
  const averageUsage = totalConsumption / consumptionHistory.length;

  const highestRecord = consumptionHistory.reduce((max, current) =>
    current.volume > max.volume ? current : max,
    consumptionHistory[0],
  );

  const values = {
    total: `${totalConsumption.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³`,
    average: `${averageUsage.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³`,
    highest: highestRecord.month,
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" data-testid="analytics-grid">
      <CurrentBalanceCard amountDue={amountDue} />
      {summaryCards.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          testId={card.testId}
          value={values[card.key]}
        />
      ))}
    </div>
  );
}

function SummaryCard({ label, testId, value }) {
  return (
    <section className="min-h-36 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_48px_rgba(15,23,42,0.06)] sm:min-h-44 sm:p-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0284C7] sm:text-xs">
        {label}
      </span>
      <h3
        className="mt-4 font-mono text-xl font-bold tracking-[-0.03em] text-[#0F172A] sm:text-2xl"
        data-testid={testId}
      >
        {value}
      </h3>
    </section>
  );
}
