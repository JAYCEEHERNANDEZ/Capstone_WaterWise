import { BarChart3, Droplets } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

const shortMonthFormatter = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  timeZone: "UTC",
});

function getConsumption(record) {
  if (
    typeof record.currentReading === "number" &&
    typeof record.previousReading === "number"
  ) {
    return Number((record.currentReading - record.previousReading).toFixed(1));
  }
  return Number(record.volume ?? 0);
}

function normalizeTrendRecord(record) {
  const consumption = getConsumption(record);
  const date = record.readingDate
    ? new Date(`${record.readingDate}T00:00:00Z`)
    : null;
  const year = String(record.year ?? record.readingDate?.slice(0, 4) ?? "");
  return {
    ...record,
    consumption,
    year,
    shortMonth: date && !Number.isNaN(date.getTime())
      ? shortMonthFormatter.format(date)
      : String(record.month ?? "").slice(0, 3),
  };
}

function UsageTooltip({ active, payload }) {
  return (
    <ChartTooltip
      active={active}
      labelFormatter={(_, record) => record.month}
      payload={payload}
      supportingFormatter={(record) =>
        typeof record.previousReading === "number" && typeof record.currentReading === "number"
          ? `Meter: ${record.previousReading.toLocaleString()} to ${record.currentReading.toLocaleString()} m³`
          : null
      }
      valueFormatter={(amount) => Number(amount).toLocaleString("en-PH", { maximumFractionDigits: 1 })}
      valueLabel="used"
    />
  );
}

export default function ConsumptionTrendGraph({ periodLabel = "Selected period", trendData = [] }) {
  const normalizedData = useMemo(
    () => trendData.map((record) => {
      const normalizedRecord = normalizeTrendRecord(record);
      return {
        ...normalizedRecord,
        axisLabel: periodLabel === "All years" && normalizedRecord.year
          ? `${normalizedRecord.shortMonth} '${normalizedRecord.year.slice(-2)}`
          : normalizedRecord.shortMonth,
      };
    }),
    [periodLabel, trendData],
  );
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6"
      data-testid="trend-graph-container"
    >
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">Usage trend</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl">Monthly Consumption</h2>
          {!normalizedData.length && (
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              No meter readings are available for this period yet.
            </p>
          )}
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-water-200 bg-water-50 px-3 py-1.5 text-xs font-bold text-water-700">
          <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />
          {periodLabel}
        </span>
      </header>

      {normalizedData.length ? (
        <>
          <div
            aria-label={`Line chart of monthly water consumption for ${periodLabel}.`}
            className="mt-4 h-56 sm:mt-6 sm:h-80"
            data-testid="graph-plot-points"
            role="img"
          >
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart accessibilityLayer data={normalizedData} margin={{ bottom: 4, left: 0, right: 12, top: 12 }}>
                <defs>
                  <linearGradient id="consumerUsageFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#DCE5EA" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="axisLabel"
                  interval="preserveStartEnd"
                  minTickGap={20}
                  tick={{ fill: "#52697A", fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, "auto"]}
                  tick={{ fill: "#52697A", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  width={42}
                />
                <Tooltip content={<UsageTooltip />} cursor={{ stroke: "#94A3B8", strokeWidth: 1 }} />
                <Area
                  activeDot={{ fill: "#0284C7", r: 6, stroke: "#FFFFFF", strokeWidth: 2 }}
                  dataKey="consumption"
                  dot={{ fill: "#FFFFFF", r: 3.5, stroke: "#0284C7", strokeWidth: 2 }}
                  fill="url(#consumerUsageFill)"
                  name="Water used"
                  isAnimationActive={false}
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  type="linear"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <details className="mt-4 border-t border-slate-200 pt-4">
            <summary className="min-h-11 cursor-pointer rounded-xl px-3 py-3 text-sm font-bold text-water-700 hover:bg-water-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600">
              View monthly data
            </summary>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <caption className="sr-only">Monthly water consumption for {periodLabel}</caption>
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr><th className="px-4 py-3" scope="col">Month</th><th className="px-4 py-3 text-right" scope="col">Water used</th><th className="px-4 py-3 text-right" scope="col">Current reading</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {normalizedData.map((record) => (
                    <tr key={record.id ?? `${record.month}-${record.readingDate}`}>
                      <td className="px-4 py-3 font-semibold text-navy-900">{record.month}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">{record.consumption.toFixed(1)} m³</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                        {record.currentReading == null ? "—" : `${Number(record.currentReading).toFixed(1)} m³`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-water-50 text-water-700">
            <Droplets aria-hidden="true" className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-bold text-navy-900">No water usage recorded</h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Your monthly trend will appear after the first meter reading is recorded.</p>
        </div>
      )}
    </section>
  );
}
