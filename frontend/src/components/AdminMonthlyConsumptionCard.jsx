import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Droplets, RefreshCw } from "lucide-react";

import { fetchOverallMonthlyPrediction } from "../services/consumptionAPI";

function AdminMonthlyConsumptionCard() {
  const [prediction, setPrediction] = useState(null);
  const [predictionPeriod, setPredictionPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrediction = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchOverallMonthlyPrediction();

      const data = response?.data ?? response;

      const predictedValue =
        data?.prediction ??
        data?.predictedConsumption ??
        data?.predicted_consumption ??
        data?.forecast ??
        data?.value ??
        0;

      const period =
        data?.predictionMonth ??
        data?.prediction_month ??
        data?.month ??
        data?.period ??
        "";

      const numericValue = Number(predictedValue);

      setPrediction(Number.isFinite(numericValue) ? numericValue : 0);

      setPredictionPeriod(period);
    } catch (err) {
      console.error("Failed to load overall monthly prediction:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load overall monthly prediction.",
      );

      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadPrediction();
    };

    fetchData();
  }, [loadPrediction]);

  const formattedValue =
    prediction !== null
      ? prediction.toLocaleString("en-PH", {
          maximumFractionDigits: 2,
        })
      : "0";

  const subtitle = predictionPeriod
    ? `Forecast for ${predictionPeriod}`
    : "Overall forecast for next month";

  return (
    <div data-testid="monthly-consumption-card"
    className="group relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-md">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-100/70 blur-2xl" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
            <Droplets className="h-6 w-6 text-sky-600" />
          </div>

          <button
            type="button"
            onClick={loadPrediction}
            disabled={loading}
            aria-label="Refresh overall monthly prediction"
            title="Refresh prediction"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Overall Monthly Prediction
        </p>

        {loading && (
          <div className="mt-3">
            <div className="h-9 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-slate-200" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-3 flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

            <p className="text-xs leading-5 text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-2 flex items-end gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formattedValue}
              </h1>

              <span className="mb-1 text-xs font-semibold text-slate-400">
                m³
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminMonthlyConsumptionCard;
