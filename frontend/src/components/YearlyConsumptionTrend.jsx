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
  fetchYearlyHistory,
  fetchOverallYearlyPrediction,
} from "../services/consumptionAPI";
import LoadingSkeleton from "./LoadingSkeleton";

const formatValue = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    maximumFractionDigits: 2,
  });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-raised">
      <p className="mb-2 text-sm font-bold text-slate-900">{label}</p>

      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-medium text-slate-600">
          {entry.name}: {formatValue(entry.value)} m³
        </p>
      ))}
    </div>
  );
};

function YearlyConsumptionTrend() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadYearlyTrend = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [historyResponse, predictionResponse] = await Promise.all([
        fetchYearlyHistory(),
        fetchOverallYearlyPrediction(),
      ]);

      const historyData =
        historyResponse?.data?.data ?? historyResponse?.data ?? historyResponse;

      const predictionData =
        predictionResponse?.data?.data ??
        predictionResponse?.data ??
        predictionResponse;

      const yearlyHistory = Array.isArray(historyData)
        ? historyData
        : (historyData?.overallYearly ??
          historyData?.yearlyHistory ??
          historyData?.history ??
          []);

      const normalizedHistory = Array.isArray(yearlyHistory)
        ? yearlyHistory
            .map((item) => {
              const year = Number(item?.year ?? 0);

              const consumption = Number(
                item?.consumption ??
                  item?.totalConsumption ??
                  item?.total_consumption ??
                  item?.value ??
                  0,
              );

              return {
                year: String(year),
                yearValue: year,
                consumption: Number.isFinite(consumption) ? consumption : 0,
                predicted: null,
              };
            })
            .filter(
              (item) => Number.isFinite(item.yearValue) && item.yearValue > 0,
            )
            .sort((a, b) => a.yearValue - b.yearValue)
        : [];

      const lastFiveYears = normalizedHistory.slice(-5);

      const predictedValue = Number(
        predictionData?.prediction ??
          predictionData?.predictedConsumption ??
          predictionData?.predicted_consumption ??
          predictionData?.forecast ??
          predictionData?.value ??
          0,
      );

      const latestHistoricalYear =
        lastFiveYears.length > 0
          ? Number(lastFiveYears[lastFiveYears.length - 1].year)
          : new Date().getFullYear();

      const predictionYear = Number(
        predictionData?.predictionYear ??
          predictionData?.prediction_year ??
          predictionData?.year ??
          predictionData?.period ??
          latestHistoricalYear + 1,
      );

      const finalPredictionYear = Number.isFinite(predictionYear)
        ? predictionYear
        : latestHistoricalYear + 1;

      const finalData = [
        ...lastFiveYears,
        {
          year: String(finalPredictionYear),
          consumption: null,
          predicted: Number.isFinite(predictedValue) ? predictedValue : 0,
        },
      ];

      setChartData(finalData);
    } catch (err) {
      console.error("Failed to load yearly consumption trend:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load yearly consumption trend.",
      );

      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadYearlyTrend();
    };

    fetchData();
  }, [loadYearlyTrend]);

  return (
    <section data-testid="yearly-consumption-trend"
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">
            Annual outlook
          </p>

          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-900">
            Yearly consumption trend
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Up to five historical years with one projected year.
          </p>
        </div>

        <button
          type="button"
          onClick={loadYearlyTrend}
          disabled={loading}
          aria-label="Refresh yearly trend"
          title="Refresh yearly trend"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-water-300 hover:bg-water-50 hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && (
        <LoadingSkeleton label="Loading yearly consumption trend" variant="chart" />
      )}

      {!loading && error && (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="text-center text-red-700" role="alert">
            <AlertCircle aria-hidden="true" className="mx-auto h-5 w-5" />
            <p className="mt-2 text-sm font-semibold">{error}</p>
            <button className="mt-4 min-h-11 rounded-xl bg-white px-4 text-sm font-bold hover:bg-red-100" onClick={loadYearlyTrend} type="button">Try again</button>
          </div>
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <div className="h-72 w-full sm:h-80" aria-label="Yearly historical consumption and forecast chart" role="img">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="year"
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
                  fontSize: 12,
                  fontWeight: 600,
                }}
                tickFormatter={(value) => formatValue(value)}
                width={60}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "13px",
                }}
              />

              <Line
                type="monotone"
                dataKey="consumption"
                name="Historical"
                stroke="#07968F"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 7,
                  fill: "#07968F",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
                connectNulls={false}
              />

              <Line
                type="monotone"
                dataKey="predicted"
                name="Prediction"
                stroke="#0B2B40"
                strokeWidth={3}
                strokeDasharray="8 6"
                dot={{
                  r: 5,
                  fill: "#ffffff",
                  stroke: "#0B2B40",
                  strokeWidth: 3,
                }}
                activeDot={{
                  r: 7,
                  fill: "#0B2B40",
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="sr-only">
            The solid teal line shows recorded yearly consumption. The dashed navy line shows the projected year.
          </p>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <div className="text-center">
            <h3 className="font-semibold text-slate-700">
              No yearly data available
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Yearly consumption history will appear once records are available.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default YearlyConsumptionTrend;
