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

  return (
    <section
      className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_56px_rgba(15,23,42,0.06)] sm:p-6"
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
              className="h-11 min-w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-[#0F172A] outline-none transition focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
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
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
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
              activeDot={{ fill: "#0284C7", r: 6, stroke: "#FFFFFF", strokeWidth: 2 }}
              dataKey="consumption"
              dot={{ fill: "#0284C7", r: 4, stroke: "#FFFFFF", strokeWidth: 2 }}
              name="Consumption"
              stroke="#0284C7"
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
