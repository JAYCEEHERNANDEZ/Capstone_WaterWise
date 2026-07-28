import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  fetchMonthlyHistory,
  fetchOverallMonthlyPrediction,
} from "../services/consumptionAPI";

const MONTH_ORDER = [
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

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function MonthlyConsumptionTrend() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMonthlyTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [historyResponse, predictionResponse] = await Promise.all([
        fetchMonthlyHistory(),
        fetchOverallMonthlyPrediction(),
      ]);

      const historyData =
        historyResponse?.data?.data ?? historyResponse?.data ?? historyResponse;

      const predictionData =
        predictionResponse?.data?.data ??
        predictionResponse?.data ??
        predictionResponse;

      const monthlyHistory = Array.isArray(historyData)
        ? historyData
        : (historyData?.overallMonthly ??
          historyData?.monthlyHistory ??
          historyData?.history ??
          []);

      const normalizedHistory = Array.isArray(monthlyHistory)
        ? monthlyHistory
            .map((item) => {
              const rawMonth = String(item?.month ?? "").toLowerCase();

              const monthIndex = MONTH_ORDER.indexOf(rawMonth);

              return {
                month:
                  monthIndex >= 0
                    ? MONTH_LABELS[monthIndex]
                    : (item?.month ?? "Unknown"),
                monthIndex: monthIndex >= 0 ? monthIndex : 999,
                consumption: Number(
                  item?.consumption ??
                    item?.totalConsumption ??
                    item?.total_consumption ??
                    item?.value ??
                    0,
                ),
                predicted: null,
              };
            })
            .filter(
              (item) =>
                Number.isFinite(item.consumption) && item.consumption > 0,
            )
            .sort((a, b) => a.monthIndex - b.monthIndex)
        : [];

      const lastFiveMonths = normalizedHistory.slice(-5);

      const predictedValue = Number(
        predictionData?.prediction ??
          predictionData?.predictedConsumption ??
          predictionData?.predicted_consumption ??
          predictionData?.forecast ??
          predictionData?.value ??
          0,
      );

      const predictionMonth =
        predictionData?.predictionMonth ??
        predictionData?.prediction_month ??
        predictionData?.month ??
        predictionData?.period ??
        "Next Month";

      const finalData = [
        ...lastFiveMonths,
        {
          month: formatMonthLabel(predictionMonth),
          consumption: null,
          predicted: Number.isFinite(predictedValue) ? predictedValue : 0,
        },
      ];

      setChartData(finalData);
    } catch (err) {
      console.error("Failed to load monthly consumption trend:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load monthly consumption trend.",
      );

      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadMonthlyTrend();
    };

    fetchData();
  }, [loadMonthlyTrend]);

  return (
    <section data-testid="monthly-consumption-trend"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            Consumption Trend
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Monthly Consumption Trend
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Five historical months with one AI-predicted month.
          </p>
        </div>

        <button
          type="button"
          onClick={loadMonthlyTrend}
          disabled={loading}
          aria-label="Refresh monthly trend"
          title="Refresh monthly trend"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
      )}

      {!loading && error && (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />

            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

              <XAxis
                dataKey="month"
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: "#cbd5e1",
                }}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fill: "#64748b",
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: "#cbd5e1",
                }}
                tickLine={false}
                width={45}
                unit=" m³"
              />

              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toLocaleString("en-PH", {
                    maximumFractionDigits: 2,
                  })} m³`,
                  name,
                ]}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="consumption"
                name="Historical"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="predicted"
                name="Prediction"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="8 5"
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
          <div className="text-center">
            <h3 className="font-semibold text-slate-700">
              No Monthly Data Available
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Monthly consumption history will appear once records are
              available.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function formatMonthLabel(value) {
  const normalized = String(value ?? "").toLowerCase();

  const matchedMonthIndex = MONTH_ORDER.findIndex((month) =>
    normalized.includes(month),
  );

  if (matchedMonthIndex >= 0) {
    return MONTH_LABELS[matchedMonthIndex];
  }

  return value || "Next Month";
}

export default MonthlyConsumptionTrend;
