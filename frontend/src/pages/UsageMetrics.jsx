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

  if (isLoading) {
    return (
      <LoadingSkeleton
        label="Loading your consumption history"
        variant="metrics"
      />
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {error && (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>{error}</span>
          <button
            className="rounded-[6px] bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
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
