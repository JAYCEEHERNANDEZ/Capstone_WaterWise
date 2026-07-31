import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";

import { fetchOverallYearlyPrediction } from "../services/consumptionAPI";
import LoadingSkeleton from "./LoadingSkeleton";

function AdminYearlyConsumptionCard() {
  const [prediction, setPrediction] = useState(null);
  const [predictionPeriod, setPredictionPeriod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPrediction = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchOverallYearlyPrediction();

      const data = response?.data ?? response;

      const predictedValue =
        data?.prediction ??
        data?.predictedConsumption ??
        data?.predicted_consumption ??
        data?.forecast ??
        data?.value ??
        0;

      const period =
        data?.predictionYear ??
        data?.prediction_year ??
        data?.year ??
        data?.period ??
        "";

      const numericValue = Number(predictedValue);

      setPrediction(Number.isFinite(numericValue) ? numericValue : 0);

      setPredictionPeriod(period);
    } catch (err) {
      console.error("Failed to load overall yearly prediction:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load overall yearly prediction.",
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
    : "Overall forecast for next year";

  return (
    <div data-testid="yearly-consumption-card"
    className="relative h-48 overflow-hidden rounded-2xl bg-navy-950 p-5 text-white shadow-card">

      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-water-900">
            <CalendarDays className="h-6 w-6 text-water-300" />
          </div>

          <button
            type="button"
            onClick={loadPrediction}
            disabled={loading}
            aria-label="Refresh overall yearly prediction"
            title="Refresh prediction"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-navy-900 text-slate-300 transition-colors hover:border-water-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Title */}
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-water-300">
          Overall Yearly Prediction
        </p>

        {/* Loading */}
        {loading && (
          <LoadingSkeleton className="mt-3 opacity-30" label="Loading yearly prediction" variant="inline" />
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-3 flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

            <p className="text-xs leading-5 text-red-500">{error}</p>
          </div>
        )}

        {/* Prediction */}
        {!loading && !error && (
          <>
            <div className="mt-2 flex items-end gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {formattedValue}
              </h1>

              <span className="mb-1 text-xs font-semibold text-slate-300">
                m³
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-300">{subtitle}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminYearlyConsumptionCard;
