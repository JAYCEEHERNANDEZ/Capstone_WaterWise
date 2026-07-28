import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Droplets, RefreshCw } from "lucide-react";

import { fetchOverallConsumptionHistory } from "../services/consumptionAPI";

function AdminOverallConsumptionCard() {
  const [consumption, setConsumption] = useState(null);
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverallConsumption = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchOverallConsumptionHistory();

      console.log("Overall consumption response:", response);

      /*
       * Handles these possible response formats:
       *
       * 1. Axios response:
       *    response.data.data
       *
       * 2. API service already returns response.data:
       *    response.data
       *
       * 3. Direct object:
       *    response
       */
      const responseData = response?.data?.data ?? response?.data ?? response;

      console.log("Parsed overall consumption data:", responseData);

      /*
       * First, check whether the backend already
       * returned a calculated total.
       */
      const directTotal =
        responseData?.overallConsumption ??
        responseData?.overall_consumption ??
        responseData?.totalConsumption ??
        responseData?.total_consumption ??
        responseData?.total ??
        responseData?.consumption ??
        responseData?.value;

      const directCount =
        responseData?.recordCount ??
        responseData?.record_count ??
        responseData?.count ??
        0;

      if (directTotal !== undefined && directTotal !== null) {
        const numericTotal = Number(directTotal);

        setConsumption(Number.isFinite(numericTotal) ? numericTotal : 0);

        setRecordCount(Number(directCount) || 0);

        return;
      }

      /*
       * If the backend returned historical records,
       * calculate their total consumption.
       */
      const records = Array.isArray(responseData)
        ? responseData
        : (responseData?.history ??
          responseData?.records ??
          responseData?.readings ??
          responseData?.consumptions ??
          responseData?.monthlyHistory ??
          responseData?.monthly_history ??
          []);

      if (!Array.isArray(records)) {
        setConsumption(0);
        setRecordCount(0);
        return;
      }

      const total = records.reduce((sum, item) => {
        const rawValue =
          item?.consumption ??
          item?.totalConsumption ??
          item?.total_consumption ??
          item?.consumptionValue ??
          item?.consumption_value ??
          item?.usage ??
          item?.volume ??
          item?.amount ??
          item?.value ??
          0;

        const numericValue = Number(rawValue);

        return sum + (Number.isFinite(numericValue) ? numericValue : 0);
      }, 0);

      setConsumption(total);
      setRecordCount(records.length);
    } catch (err) {
      console.error("Failed to load overall consumption:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load overall consumption.",
      );

      setConsumption(null);
      setRecordCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadOverallConsumption();
    };

    fetchData();
  }, [loadOverallConsumption]);

  const formattedValue =
    consumption !== null
      ? consumption.toLocaleString("en-PH", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : "0";

  const subtitle =
    recordCount > 0
      ? `Total from ${recordCount} historical records`
      : "Total historical water consumption";

  return (
    <div className="group relative h-56 overflow-hidden rounded-2xl bg-slate-900 p-5 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Background glow */}
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-500/20 blur-2xl" />

      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/20">
            <Droplets className="h-6 w-6 text-sky-300" />
          </div>

          <button
            type="button"
            onClick={loadOverallConsumption}
            disabled={loading}
            aria-label="Refresh overall consumption"
            title="Refresh overall consumption"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Title */}
        <p data-testid="overall-consumption-card"
        className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">
          Overall Consumption
        </p>

        {/* Loading */}
        {loading && (
          <div className="mt-3">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-white/10" />

            <div className="mt-3 h-4 w-48 animate-pulse rounded bg-white/10" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-3 flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />

            <p className="line-clamp-3 text-xs leading-5 text-rose-200">
              {error}
            </p>
          </div>
        )}

        {/* Consumption */}
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

export default AdminOverallConsumptionCard;
