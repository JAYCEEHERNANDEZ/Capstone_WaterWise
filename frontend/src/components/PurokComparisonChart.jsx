import { useCallback, useEffect, useState } from "react";

import { AlertCircle, RefreshCw } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import { fetchAllPuroksMonthlyHistory } from "../services/consumptionAPI";
import LoadingSkeleton from "./LoadingSkeleton";

const DEFAULT_PUROKS = [
  "Purok 1",
  "Purok 2",
  "Purok 3",
  "Purok 4",
  "Purok 5",
  "Purok 6",
];

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const BAR_COLORS = [
  "#07968F",
  "#07968F",
  "#07968F",
  "#07968F",
  "#07968F",
  "#07968F",
];

const formatValue = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const extractResponseData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? [];

const getMonthIndex = (month) => {
  const normalizedMonth = String(month ?? "").toLowerCase();

  return MONTHS.findIndex(
    (item) =>
      normalizedMonth === item || normalizedMonth.startsWith(item.slice(0, 3)),
  );
};

const formatMonth = (month) => {
  const index = getMonthIndex(month);

  if (index < 0) {
    return month || "Latest Month";
  }

  return MONTHS[index]
    .slice(0, 3)
    .replace(/^./, (letter) => letter.toUpperCase());
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const record = payload[0]?.payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-raised">
      <p className="font-bold text-slate-900">{label}</p>

      <p className="mt-1 text-sm text-slate-600">
        {formatValue(record?.consumption)} m³
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {record?.month} {record?.year}
      </p>
    </div>
  );
};

function PurokComparisonChart({
  title = "Latest consumption by purok",
  graphTitle = "Recorded monthly consumption",
}) {
  const [chartData, setChartData] = useState([]);

  const [latestPeriod, setLatestPeriod] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadComparison = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchAllPuroksMonthlyHistory();

      const responseData = extractResponseData(response);

      const historyList = Array.isArray(responseData)
        ? responseData
        : (responseData?.allPuroksMonthly ??
          responseData?.history ??
          responseData?.data ??
          []);

      /*
       * Kinukuha muna ang pinakahuling period
       * sa buong dataset.
       */
      const allHistoricalRecords = historyList.flatMap((item) => {
        const historical = Array.isArray(item?.historical)
          ? item.historical
          : Array.isArray(item?.monthly)
            ? item.monthly
            : [];

        return historical.map((record) => ({
          ...record,
          purok: item?.purok,
          year: Number(
            record?.year ?? item?.latestYear ?? new Date().getFullYear(),
          ),
          monthIndex: getMonthIndex(record?.month),
        }));
      });

      const validRecords = allHistoricalRecords
        .map((record) => {
          const consumption = Number(
            record?.consumption ??
              record?.totalConsumption ??
              record?.total_consumption ??
              record?.value ??
              0,
          );

          return {
            ...record,
            consumption: Number.isFinite(consumption) ? consumption : 0,
          };
        })
        .filter(
          (record) =>
            record.monthIndex >= 0 &&
            Number.isFinite(record.year) &&
            record.consumption > 0,
        )
        .sort((a, b) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }

          return b.monthIndex - a.monthIndex;
        });

      const latestRecord = validRecords[0];

      const latestYear = latestRecord?.year;

      const latestMonthIndex = latestRecord?.monthIndex;

      const latestMonth = latestRecord?.month;

      if (latestRecord) {
        setLatestPeriod(`${formatMonth(latestMonth)} ${latestYear}`);
      } else {
        setLatestPeriod("");
      }

      /*
       * Isang bar bawat Purok 1–6.
       * Kinukuha lamang ang record na tumutugma
       * sa latest month at latest year.
       */
      const comparisonData = DEFAULT_PUROKS.map((purokName) => {
        const matchingRecord = validRecords.find(
          (record) =>
            String(record?.purok ?? "").toLowerCase() ===
              purokName.toLowerCase() &&
            record.year === latestYear &&
            record.monthIndex === latestMonthIndex,
        );

        const consumption = Number(
          matchingRecord?.consumption ??
            matchingRecord?.totalConsumption ??
            matchingRecord?.total_consumption ??
            matchingRecord?.value ??
            0,
        );

        return {
          purok: purokName,
          consumption: Number.isFinite(consumption) ? consumption : 0,
          month: formatMonth(matchingRecord?.month ?? latestMonth),
          year: matchingRecord?.year ?? latestYear,
        };
      });

      setChartData(comparisonData);
    } catch (err) {
      console.error("Failed to load purok comparison:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load purok comparison data.",
      );

      setChartData([]);
      setLatestPeriod("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadComparison();
    };

    fetchData();
  }, [loadComparison]);

  const hasConsumption = chartData.some((item) => Number(item.consumption) > 0);
  const highestPurok = chartData.reduce(
    (highest, item) =>
      Number(item.consumption) > Number(highest?.consumption ?? -1) ? item : highest,
    null,
  );

  return (
    <section data-testid="purok-comparison-chart"
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">
            Purok analytics
          </p>

          <h2 className="mt-1 text-xl font-extrabold text-navy-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {graphTitle}
            {latestPeriod ? ` for ${latestPeriod}.` : "."}
          </p>
        </div>

        <button
          type="button"
          onClick={loadComparison}
          disabled={loading}
          aria-label="Refresh purok comparison"
          title="Refresh"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-water-300 hover:bg-water-50 hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <LoadingSkeleton label="Loading purok comparison" variant="chart" />
      )}

      {!loading && error && (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="text-center text-red-700" role="alert">
            <AlertCircle aria-hidden="true" className="mx-auto h-5 w-5" />
            <p className="mt-2 text-sm font-semibold">{error}</p>
            <button className="mt-4 min-h-11 rounded-xl bg-white px-4 text-sm font-bold hover:bg-red-100" onClick={loadComparison} type="button">Try again</button>
          </div>
        </div>
      )}

      {!loading && !error && hasConsumption && (
        <div className="h-72 w-full sm:h-80" aria-label="Latest consumption comparison across puroks" role="img">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 15,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="purok"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
                tickFormatter={(value) => formatValue(value)}
                width={55}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "#f1f5f9",
                }}
              />

              <Bar
                dataKey="consumption"
                name="Consumption"
                radius={[8, 8, 0, 0]}
                maxBarSize={65}
              >
                {chartData.map((item, index) => (
                  <Cell
                    key={item.purok}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="sr-only">
            Bar chart comparing the latest recorded water consumption for Purok 1 through Purok 6.
          </p>
        </div>
      )}

      {!loading && !error && hasConsumption && highestPurok && (
        <p className="mt-4 rounded-xl border border-water-200 bg-water-50 p-4 text-sm leading-6 text-water-900">
          <strong>{highestPurok.purok}</strong> recorded the highest consumption for this comparison at{" "}
          <strong className="font-mono tabular-nums">
            {formatValue(highestPurok.consumption)} m³
          </strong>
          . Review the underlying readings before deciding on an intervention.
        </p>
      )}

      {!loading && !error && !hasConsumption && (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <div className="text-center">
            <h3 className="font-semibold text-slate-700">
              No comparison data available
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Latest monthly consumption records will appear here.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default PurokComparisonChart;
