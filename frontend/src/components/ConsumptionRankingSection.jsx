import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Award, Medal, RefreshCw, Trophy } from "lucide-react";

import { fetchConsumptionRanking } from "../services/consumptionAPI";

function ConsumptionRankingSection() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchConsumptionRanking();

      const responseData = response?.data ?? response;

      const rankingData =
        responseData?.ranking ?? responseData?.data ?? responseData ?? [];

      setRanking(Array.isArray(rankingData) ? rankingData : []);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load consumption ranking.",
      );

      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await loadRanking();
    };

    fetchData();
  }, [loadRanking]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 0:
        return <Trophy className="h-5 w-5 text-amber-500" />;

      case 1:
        return <Medal className="h-5 w-5 text-slate-400" />;

      case 2:
        return <Award className="h-5 w-5 text-orange-500" />;

      default:
        return (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
            {rank + 1}
          </span>
        );
    }
  };

  return (
    <section data-testid="consumption-ranking-section"
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
            Analytics
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
            Consumption Ranking
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Water consumption ranking by purok.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRanking}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5" />

          <span>{error}</span>
        </div>
      )}

      {/* Ranking */}
      {!loading && !error && ranking.length > 0 && (
        <div className="space-y-3">
          {ranking.map((item, index) => (
            <div
              key={item.purok}
              data-testid="ranking-row"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-sky-200 hover:bg-sky-50"
            >
              <div className="flex items-center gap-4">
                {getRankIcon(index)}

                <div>
                  <h3 className="font-semibold text-slate-900">{item.purok}</h3>

                  <p className="text-sm text-slate-500">Rank #{index + 1}</p>
                </div>
              </div>

              <div className="text-right">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {Number(item?.consumption ?? item?.value ?? 0).toLocaleString(
                    "en-PH",
                    {
                      maximumFractionDigits: 2,
                    },
                  )}
                </h3>

                <p className="text-sm text-slate-500">m³</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && ranking.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-700">
            No Ranking Available
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Consumption ranking will appear once data is available.
          </p>
        </div>
      )}
    </section>
  );
}

export default ConsumptionRankingSection;
