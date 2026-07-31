import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function getRecordYear(record) {
  return String(record.year ?? record.readingDate?.slice(0, 4) ?? record.month?.match(/\d{4}/)?.[0] ?? "");
}

function getConsumption(record) {
  if (
    typeof record.currentReading === "number" &&
    typeof record.previousReading === "number"
  ) {
    return Number((record.currentReading - record.previousReading).toFixed(1));
  }

  return record.volume ?? 0;
}

function normalizeTrendRecord(record) {
  const consumption = getConsumption(record);

  return {
    ...record,
    consumption,
    month: record.month,
    year: getRecordYear(record),
    volume: consumption,
  };
}

function UsageTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const record = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
      <p className="text-sm font-bold text-[#0F172A]">{label}</p>
      <p className="mt-1 font-mono text-sm text-[#0284C7]">
        {record.consumption} m³ consumed
      </p>
      {typeof record.previousReading === "number" &&
        typeof record.currentReading === "number" && (
          <p className="mt-1 text-xs text-slate-500">
            {record.currentReading} - {record.previousReading} meter reading
          </p>
        )}
    </div>
  );
}

export default function ConsumptionTrendGraph({ trendData = [] }) {
  const normalizedData = useMemo(
    () => trendData.map(normalizeTrendRecord),
    [trendData],
  );

  const yearOptions = useMemo(
    () =>
      Array.from(new Set(normalizedData.map((record) => record.year).filter(Boolean))).sort(),
    [normalizedData],
  );

  const [selectedYear, setSelectedYear] = useState(yearOptions.at(-1) ?? "all");
  const activeYear = yearOptions.includes(selectedYear) ? selectedYear : yearOptions.at(-1) ?? "all";
  const filteredData =
    activeYear === "all"
      ? normalizedData
      : normalizedData.filter((record) => record.year === activeYear);
  const filteredTotal = filteredData.reduce((sum, record) => sum + record.consumption, 0);
  const filteredAverage = filteredData.length > 0 ? filteredTotal / filteredData.length : 0;

  return (
    <section
      className="ww-glass-strong rounded-[24px] p-4 sm:p-6"
      data-testid="trend-graph-container"
    >
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0284C7]">
            Usage trend
          </p>
          <h3 className="mt-1.5 text-xl font-extrabold tracking-[-0.03em] text-[#0F172A] sm:text-2xl">
            Monthly consumption
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            {filteredData.length > 0
              ? `Average use for this view is ${filteredAverage.toLocaleString("en-US", { maximumFractionDigits: 1 })} m³ per recorded month.`
              : "No meter readings are available for this period yet."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div
            className="hidden font-mono text-sm font-bold text-slate-500 sm:block"
            data-testid="y-axis-labels"
          >
            <span>Volume (m³)</span>
          </div>

          <label className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Year
            </span>
            <select
              className="ww-field h-11 min-w-24 px-3 text-sm font-bold"
              data-testid="year-filter"
              onChange={(event) => setSelectedYear(event.target.value)}
              value={activeYear}
            >
              {yearOptions.length === 0 ? (
                <option value="all">All</option>
              ) : (
                yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
      </div>

      <div className="h-64 sm:h-80" data-testid="graph-plot-points">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={filteredData} margin={{ bottom: 8, left: -20, right: 8, top: 16 }}>
            <CartesianGrid stroke="#D8E2E8" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
              unit=" m³"
            />
            <Tooltip content={<UsageTooltip />} />
            <Line
              activeDot={{ fill: "#0284B8", r: 6, stroke: "#FFFFFF", strokeWidth: 2 }}
              dataKey="consumption"
              dot={{ fill: "#0284B8", r: 4, stroke: "#FFFFFF", strokeWidth: 2 }}
              name="Consumption"
              stroke="#0284B8"
              strokeWidth={3}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="sr-only" data-testid="x-axis-labels">
        {filteredData.map((dataPoint) => (
          <span key={dataPoint.month} data-testid="axis-month-label">
            {dataPoint.month}
          </span>
        ))}
      </div>

      <div className="sr-only">
        {filteredData.map((dataPoint, index) => (
          <span
            data-index={index}
            data-month={dataPoint.month}
            data-testid="graph-node"
            data-volume={dataPoint.consumption}
            key={dataPoint.month}
          >
            {dataPoint.consumption} m³
          </span>
        ))}
      </div>
    </section>
  );
}
