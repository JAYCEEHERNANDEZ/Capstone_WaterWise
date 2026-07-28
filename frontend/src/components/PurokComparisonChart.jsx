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
  "#0284c7",
  "#0ea5e9",
  "#38bdf8",
  "#0369a1",
  "#075985",
  "#0c4a6e",
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
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
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
  title = "Purok Comparison Chart",
  graphTitle = "Latest Monthly Consumption",
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

  return (
    <section data-testid="purok-comparison-chart"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            Purok Analytics
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
      )}

      {!loading && error && (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && hasConsumption && (
        <div className="h-96 w-full">
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
        </div>
      )}

      {!loading && !error && !hasConsumption && (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
          <div className="text-center">
            <h3 className="font-semibold text-slate-700">
              No Comparison Data Available
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
