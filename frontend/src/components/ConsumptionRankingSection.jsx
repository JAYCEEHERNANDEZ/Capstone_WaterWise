import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BarChart3, RefreshCw, Trophy } from "lucide-react";
import { fetchConsumptionRanking } from "../services/consumptionAPI";
import LoadingSkeleton from "./LoadingSkeleton";

export default function ConsumptionRankingSection() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchConsumptionRanking();
      const responseData = response?.data ?? response;
      const rankingData = responseData?.ranking ?? responseData?.data ?? responseData ?? [];
      setRanking(Array.isArray(rankingData) ? rankingData : []);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ??
          requestError?.message ??
          "Unable to load consumption priorities.",
      );
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadRanking);
  }, [loadRanking]);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"
      data-testid="consumption-ranking-section"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-water-700">
            Priority overview
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-navy-900">
            Highest-consuming puroks
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Ranked recorded consumption for prioritizing review—not proof of waste or leakage.
          </p>
        </div>
        <button
          aria-label="Refresh consumption ranking"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-water-300 hover:bg-water-50 hover:text-water-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 disabled:opacity-50"
          disabled={loading}
          onClick={loadRanking}
          title="Refresh consumption ranking"
          type="button"
        >
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton className="mt-5" count={5} label="Loading consumption ranking" variant="list" />
      ) : error ? (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          <span className="flex items-start gap-2 font-semibold">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </span>
          <button className="min-h-11 rounded-xl bg-white px-3 font-bold hover:bg-red-100" onClick={loadRanking} type="button">
            Try again
          </button>
        </div>
      ) : ranking.length ? (
        <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
          {ranking.map((item, index) => {
            const value = Number(item?.consumption ?? item?.value ?? 0);
            const first = index === 0;
            return (
              <div
                className={`flex items-center justify-between gap-4 px-1 py-4 ${first ? "bg-water-50/70" : ""}`}
                data-testid="ranking-row"
                key={item.purok ?? index}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-extrabold tabular-nums ${
                      first ? "bg-water-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {first ? <Trophy aria-hidden="true" className="h-5 w-5" /> : index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-navy-900">{item.purok}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {first ? "Highest recorded consumption" : `Priority rank ${index + 1}`}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 text-right font-mono text-lg font-extrabold tabular-nums text-navy-900">
                  {Number.isFinite(value)
                    ? value.toLocaleString("en-PH", { maximumFractionDigits: 2 })
                    : "0"}
                  <span className="ml-1 text-xs text-slate-500">m³</span>
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <BarChart3 aria-hidden="true" className="h-6 w-6 text-slate-400" />
          <h3 className="mt-3 font-bold text-navy-900">No ranking available</h3>
          <p className="mt-1 text-sm text-slate-500">Rankings will appear after consumption records are available.</p>
        </div>
      )}
    </section>
  );
}
