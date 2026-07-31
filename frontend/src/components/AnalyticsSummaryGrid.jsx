import CurrentBalanceCard from "./CurrentBalanceCard";

const summaryCards = [
  { key: "total", label: "Water used in this view", testId: "stat-total" },
  { key: "average", label: "Average monthly use", testId: "stat-avg" },
  { key: "highest", label: "Highest-use month", testId: "stat-highest" },
];

export default function AnalyticsSummaryGrid({ amountDue = 0, consumptionHistory = [] }) {
  const totalConsumption = consumptionHistory.reduce((acc, curr) => acc + curr.volume, 0);
  const averageUsage = consumptionHistory.length > 0
    ? totalConsumption / consumptionHistory.length
    : 0;
  const highestRecord = consumptionHistory.length > 0
    ? consumptionHistory.reduce((max, current) => current.volume > max.volume ? current : max)
    : null;

  const values = {
    total: `${totalConsumption.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³`,
    average: `${averageUsage.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³`,
    highest: highestRecord?.month ?? "No readings yet",
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" data-testid={consumptionHistory.length ? "analytics-grid" : "analytics-empty"}>
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
    <section className="ww-glass min-h-36 rounded-[20px] p-4 sm:min-h-44 sm:p-5">
      <span className="text-[11px] font-bold leading-4 text-sky-700 sm:text-xs">
        {label}
      </span>
      <h3
        className="ww-data-value mt-4 font-mono text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl"
        data-testid={testId}
      >
        {value}
      </h3>
    </section>
  );
}
