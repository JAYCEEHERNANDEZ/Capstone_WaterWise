import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, MapPinned, RefreshCw } from "lucide-react";
import {
  fetchAllPuroksMonthlyPrediction,
  fetchAllPuroksYearlyPrediction,
} from "../services/consumptionAPI";
import LoadingSkeleton from "./LoadingSkeleton";

const DEFAULT_PUROKS = Array.from({ length: 6 }, (_, index) => `Purok ${index + 1}`);

export default function AdminPerPurokConsumptionCard() {
  const [period, setPeriod] = useState("Monthly");
  const [puroks, setPuroks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response =
        period === "Monthly"
          ? await fetchAllPuroksMonthlyPrediction()
          : await fetchAllPuroksYearlyPrediction();
      const data = response?.data ?? response;
      const predictions = data?.predictions ?? data?.puroks ?? data?.data ?? data ?? [];
      setPuroks(Array.isArray(predictions) ? predictions : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ??
          requestError?.message ??
          "Unable to load purok forecasts.",
      );
      setPuroks([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    queueMicrotask(loadPredictions);
  }, [loadPredictions]);

  const forecastRecords = useMemo(
    () =>
      DEFAULT_PUROKS.map((purokName) => {
        const record =
          puroks.find(
            (item) => item?.name === purokName || item?.purok === purokName,
          ) ?? {};
        const value = Number(
          record?.value ??
            record?.prediction ??
            record?.predictedConsumption ??
            record?.predicted_consumption ??
            record?.forecast ??
            0,
        );
        return { purok: purokName, value: Number.isFinite(value) ? value : 0 };
      }),
    [puroks],
  );
  const highestForecast = forecastRecords.reduce(
    (highest, record) => (record.value > highest.value ? record : highest),
    forecastRecords[0],
  );
  const hasForecast = forecastRecords.some((record) => record.value > 0);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"
      data-testid="purok-consumption-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">
            Area forecast
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-navy-900 sm:text-xl">
            Predicted consumption by purok
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Compare expected demand before assigning inspections or resources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            aria-label="Purok forecast period"
            className="inline-flex rounded-xl bg-slate-100 p-1"
            role="group"
          >
            {["Monthly", "Yearly"].map((option) => (
              <button
                aria-pressed={period === option}
                className={`min-h-11 rounded-lg px-3 text-sm font-bold transition-colors ${
                  period === option
                    ? "bg-white text-water-700 shadow-sm"
                    : "text-slate-600 hover:text-navy-900"
                }`}
                key={option}
                onClick={() => setPeriod(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <button
            aria-label="Refresh purok forecasts"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-water-300 hover:bg-water-50 hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 disabled:opacity-50"
            disabled={loading}
            onClick={loadPredictions}
            title="Refresh purok forecasts"
            type="button"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton className="mt-5" count={3} label="Loading purok forecasts" variant="list" />
      ) : error ? (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <span className="flex items-start gap-2 font-semibold">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </span>
          <button className="min-h-11 rounded-xl bg-white px-3 font-bold hover:bg-red-100" onClick={loadPredictions} type="button">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {forecastRecords.map((record) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={record.purok}>
                <p className="text-xs font-bold text-slate-500">{record.purok}</p>
                <p className="mt-2 font-mono text-xl font-extrabold tabular-nums text-navy-900">
                  {record.value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}
                  <span className="ml-1 text-xs font-bold text-slate-500">m³</span>
                </p>
              </div>
            ))}
          </div>
          {hasForecast ? (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-water-200 bg-water-50 p-4">
              <MapPinned aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-water-700" />
              <p className="text-sm leading-6 text-water-900">
                <strong>{highestForecast.purok}</strong> has the highest {period.toLowerCase()} forecast at{" "}
                <strong className="font-mono tabular-nums">
                  {highestForecast.value.toLocaleString("en-PH", { maximumFractionDigits: 2 })} m³
                </strong>
                . Use this as a planning signal, not an automatic intervention trigger.
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No positive {period.toLowerCase()} purok forecasts are available yet.
            </p>
          )}
        </>
      )}
    </section>
  );
}
