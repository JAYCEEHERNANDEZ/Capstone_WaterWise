import { useCallback, useEffect, useState } from "react";
import AnalyticsSummaryGrid from "../components/AnalyticsSummaryGrid";
import ConsumptionTrendGraph from "../components/ConsumptionTrendGraph";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { fetchCurrentBalance } from "../services/consumerPortal.service";
import { fetchConsumptionHistory } from "../services/consumptionHistory.service";
import { isCanceledRequest } from "../services/apiClient";

export default function UsageMetrics({
  amountDue: amountDueProp,
  usageHistory,
}) {
  const usesApi = usageHistory === undefined;
  const [history, setHistory] = useState([]);
  const [amountDue, setAmountDue] = useState(amountDueProp ?? 0);
  const [isLoading, setIsLoading] = useState(usesApi);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError("");
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!usesApi) {
      return undefined;
    }

    const controller = new AbortController();

    Promise.all([
      fetchConsumptionHistory({ signal: controller.signal }),
      fetchCurrentBalance({ signal: controller.signal }),
    ])
      .then(([nextHistory, nextBalance]) => {
        setHistory(nextHistory);
        setAmountDue(nextBalance);
      })
      .catch((requestError) => {
        if (!isCanceledRequest(requestError)) {
          setHistory([]);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [requestVersion, usageHistory, usesApi]);

  const displayedHistory = usesApi ? history : usageHistory;
  const displayedAmountDue = usesApi ? amountDue : amountDueProp ?? 0;
  const latestUsage = displayedHistory.at(-1)?.volume ?? 0;
  const previousUsage = displayedHistory.at(-2)?.volume;
  const usageDifference = previousUsage === undefined ? null : latestUsage - previousUsage;
  const pageHeader = (
    <header className="ww-page-header text-white">
      <p className="ww-eyebrow">Resident portal</p>
      <h2 className="mt-2 font-extrabold tracking-tight">Water usage overview</h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-sky-100">
        Review your current balance, latest water use, and monthly consumption history.
      </p>
    </header>
  );

  if (isLoading) {
    return (
      <div className="space-y-5">
        {pageHeader}
        <LoadingSkeleton
          label="Loading your consumption history"
          variant="metrics"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {pageHeader}

      <section className="ww-glass flex flex-col gap-3 rounded-[20px] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="ww-eyebrow !text-sky-700">Your water at a glance</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">
            {usageDifference === null
              ? "Your latest bill and water-use records appear here."
              : usageDifference === 0
                ? "Your latest water use is the same as the previous month."
                : `Your latest water use is ${Math.abs(usageDifference).toLocaleString("en-US", { maximumFractionDigits: 1 })} m³ ${usageDifference > 0 ? "higher" : "lower"} than the previous month.`}
          </p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${displayedAmountDue > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
          {displayedAmountDue > 0 ? "Payment needed" : "Account up to date"}
        </span>
      </section>

      {error && (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{error}</span>
          <button
            className="min-h-11 rounded-xl bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
            onClick={retry}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      <AnalyticsSummaryGrid amountDue={displayedAmountDue} consumptionHistory={displayedHistory} />

      <ConsumptionTrendGraph trendData={displayedHistory} />
    </div>
  );
}
