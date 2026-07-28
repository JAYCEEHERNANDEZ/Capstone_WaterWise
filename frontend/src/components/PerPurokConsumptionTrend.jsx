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
  fetchAllPuroksMonthlyHistory,
  fetchAllPuroksMonthlyPrediction,
  fetchAllPuroksYearlyHistory,
  fetchAllPuroksYearlyPrediction,
} from "../services/consumptionAPI";

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

const formatConsumption = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const normalizeMonth = (month) => {
  const normalizedMonth = String(month ?? "").toLowerCase();

  const monthIndex = MONTHS.findIndex(
    (item) =>
      normalizedMonth === item || normalizedMonth.startsWith(item.slice(0, 3)),
  );

  return {
    monthIndex,

    label:
      monthIndex >= 0 ? MONTH_LABELS[monthIndex] : String(month ?? "Unknown"),
  };
};

const extractResponseData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? [];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const validPayload = payload.filter(
    (entry) => entry.value !== null && entry.value !== undefined,
  );

  if (!validPayload.length) {
    return null;
  }

  return (
    <div
      className="
rounded-xl
border
border-slate-200
bg-white
px-4
py-3
shadow-lg
"
    >
      <p
        className="
mb-2
text-sm
font-bold
text-slate-900
"
      >
        {label}
      </p>

      {validPayload.map((entry) => (
        <p
          key={entry.dataKey}
          className="
text-sm
font-medium
"
          style={{
            color: entry.color,
          }}
        >
          {entry.name}: {formatConsumption(entry.value)}
          m³
        </p>
      ))}
    </div>
  );
};

function PerPurokConsumptionTrend() {
  const [period, setPeriod] = useState("Monthly");

  const [purokData, setPurokData] = useState({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadPerPurokTrend = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const [historyResponse, predictionResponse] = await Promise.all([
        period === "Monthly"
          ? fetchAllPuroksMonthlyHistory()
          : fetchAllPuroksYearlyHistory(),

        period === "Monthly"
          ? fetchAllPuroksMonthlyPrediction()
          : fetchAllPuroksYearlyPrediction(),
      ]);

      const historyResult = extractResponseData(historyResponse);

      const predictionResult = extractResponseData(predictionResponse);

      const historyList = Array.isArray(historyResult)
        ? historyResult
        : period === "Monthly"
          ? (historyResult?.allPuroksMonthly ??
            historyResult?.history ??
            historyResult?.data ??
            [])
          : (historyResult?.allPuroksYearly ??
            historyResult?.history ??
            historyResult?.data ??
            []);

      const predictionList = Array.isArray(predictionResult)
        ? predictionResult
        : period === "Monthly"
          ? (predictionResult?.allPuroksMonthly ??
            predictionResult?.predictions ??
            predictionResult?.data ??
            [])
          : (predictionResult?.allPuroksYearly ??
            predictionResult?.predictions ??
            predictionResult?.data ??
            []);

      const combinedData = {};

      DEFAULT_PUROKS.forEach((purokName) => {
        const purokHistory = historyList.find(
          (item) =>
            String(item?.purok ?? "").toLowerCase() === purokName.toLowerCase(),
        );

        const purokPrediction = predictionList.find(
          (item) =>
            String(item?.purok ?? "").toLowerCase() === purokName.toLowerCase(),
        );

        const historicalRecords = Array.isArray(purokHistory?.historical)
          ? purokHistory.historical
          : Array.isArray(purokHistory?.monthly)
            ? purokHistory.monthly
            : Array.isArray(purokHistory?.yearly)
              ? purokHistory.yearly
              : Array.isArray(purokHistory)
                ? purokHistory
                : [];

        const normalizedHistory = historicalRecords.map((record) => {
          const consumption = Number(
            record?.consumption ??
              record?.totalConsumption ??
              record?.total_consumption ??
              record?.value ??
              0,
          );

          const label =
            period === "Monthly"
              ? normalizeMonth(record?.month).label
              : String(record?.year ?? "Unknown");

          return {
            label,

            year: record?.year,

            consumption: Number.isFinite(consumption) ? consumption : 0,

            predicted: null,
          };
        });

        const latestThree = normalizedHistory.slice(-3);

        const predictionValue = Number(
          purokPrediction?.prediction ??
            purokPrediction?.predictedConsumption ??
            purokPrediction?.predicted_consumption ??
            purokPrediction?.forecast ??
            purokPrediction?.value ??
            0,
        );

        const connectedHistory = latestThree.map((record, index) => ({
          ...record,

          predicted:
            index === latestThree.length - 1 ? record.consumption : null,
        }));

        let predictionLabel = "Next";

        if (period === "Monthly") {
          const lastLabel = latestThree[latestThree.length - 1]?.label;

          const { monthIndex } = normalizeMonth(lastLabel);

          if (monthIndex >= 0) {
            predictionLabel = MONTH_LABELS[(monthIndex + 1) % 12];
          }
        } else {
          const lastYear = Number(latestThree[latestThree.length - 1]?.year);

          if (Number.isFinite(lastYear)) {
            predictionLabel = String(lastYear + 1);
          }
        }

        const chartData = [
          ...connectedHistory,

          {
            label: predictionLabel,

            consumption: null,

            predicted: Number.isFinite(predictionValue) ? predictionValue : 0,

            isPrediction: true,
          },
        ];

        combinedData[purokName] = {
          chartData:
            latestThree.length > 0 || predictionValue > 0 ? chartData : [],

          predictedConsumption: predictionValue,
        };
      });

      setPurokData(combinedData);
    } catch (err) {
      console.error("Failed to load per purok trend:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load per purok consumption trend.",
      );

      setPurokData({});
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const run = async () => {
      await loadPerPurokTrend();
    };

    run();
  }, [loadPerPurokTrend]);

  return (
    <section
    data-testid="purok-consumption-trend"
      className="
rounded-3xl
border
border-slate-200
bg-white
p-6
shadow-sm
"
    >
      {/* HEADER */}

      <div
        className="
mb-6
flex
items-start
justify-between
gap-4
"
      >
        <div>
          <p
            className="
text-xs
font-bold
uppercase
tracking-[0.18em]
text-sky-600
"
          >
            Consumption Trend
          </p>

          <h2
            className="
mt-2
text-2xl
font-extrabold
text-slate-900
"
          >
            Per Purok Consumption Trend
          </h2>

          <p
            className="
mt-1
text-sm
text-slate-500
"
          >
            {period === "Monthly"
              ? "Three historical months with one predicted month for each purok."
              : "Three historical years with one predicted year for each purok."}
          </p>

          <div
            className="
mt-4
flex
gap-2
"
          >
            <button
              onClick={() => setPeriod("Monthly")}
              className={`

rounded-lg
px-4
py-2
text-xs
font-semibold

${
  period === "Monthly" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
}

`}
            >
              Monthly
            </button>

            <button
              onClick={() => setPeriod("Yearly")}
              className={`

rounded-lg
px-4
py-2
text-xs
font-semibold

${period === "Yearly" ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"}

`}
            >
              Yearly
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={loadPerPurokTrend}
          disabled={loading}
          className="
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-slate-100
text-slate-600
transition
hover:bg-slate-200
disabled:opacity-50
"
        >
          <RefreshCw
            className={`

h-4
w-4

${loading ? "animate-spin" : ""}

`}
          />
        </button>
      </div>

      {/* LOADING */}

      {loading && (
        <div
          className="
grid
grid-cols-1
gap-6
md:grid-cols-2
xl:grid-cols-3
"
        >
          {DEFAULT_PUROKS.map((purok) => (
            <div
              key={purok}
              className="
h-80
animate-pulse
rounded-2xl
bg-slate-100
"
            />
          ))}
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div
          className="
flex
min-h-56
items-center
justify-center
rounded-2xl
border
border-red-200
bg-red-50
"
        >
          <div
            className="
flex
items-center
gap-2
text-red-600
"
          >
            <AlertCircle
              className="
h-5
w-5
"
            />

            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* CHARTS */}

      {!loading && !error && (
        <div
          className="
grid
grid-cols-1
gap-6
md:grid-cols-2
xl:grid-cols-3
"
        >
          {DEFAULT_PUROKS.map((purok) => {
            const records = purokData[purok];

            const chartData = records?.chartData ?? [];

            return (
              <article
                key={purok}
                className="
rounded-2xl
border
border-slate-200
bg-slate-50
p-4
"
              >
                <div
                  className="
flex
items-start
justify-between
"
                >
                  <div>
                    <h3
                      className="
font-bold
text-slate-900
"
                    >
                      {purok}
                    </h3>

                    <p
                      className="
mt-1
text-xs
text-slate-500
"
                    >
                      {period === "Monthly"
                        ? "Monthly water consumption"
                        : "Yearly water consumption"}
                    </p>
                  </div>

                  {records?.predictedConsumption > 0 && (
                    <div
                      className="
text-right
"
                    >
                      <p
                        className="
text-xs
text-slate-500
"
                      >
                        Prediction
                      </p>

                      <p
                        className="
font-extrabold
text-amber-600
"
                      >
                        {formatConsumption(records.predictedConsumption)}
                        m³
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="
mt-4
h-60
"
                >
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 10,
                          right: 12,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis dataKey="label" />

                        <YAxis
                          tickFormatter={(value) => formatConsumption(value)}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="consumption"
                          name="Historical"
                          stroke="#0284c7"
                          strokeWidth={3}
                        />

                        <Line
                          type="monotone"
                          dataKey="predicted"
                          name="Prediction"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          strokeDasharray="8 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PerPurokConsumptionTrend;
