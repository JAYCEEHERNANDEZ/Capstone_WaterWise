import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

import { generateAllAnomalies } from "../services/anomalyAPI";
import { isCanceledRequest } from "../services/apiClient";
import { fetchAllRecommendations } from "../services/recommendationAPI";
import AnomalyAlertCard from "./AnomalyAlertCard";
import LoadingSkeleton from "./LoadingSkeleton";

const EMPTY_ANALYSIS = {
  overallMonthly: null,
  overallYearly: null,
  allPuroksMonthly: [],
  allPuroksYearly: [],
};

const EMPTY_RECOMMENDATIONS = {
  overallMonthly: null,
  overallYearly: null,
  allPuroksMonthly: [],
  allPuroksYearly: [],
};

function AnomalyGroup({ items, title }) {
  return (
    <div>
      <h3 className="mb-3 font-bold text-slate-900">{title}</h3>
      {items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <AnomalyAlertCard
              anomalies={item.anomalies}
              area={item.purok}
              key={item.purok}
              message={item.summary}
              riskScore={item.riskScore}
              severity={item.status}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No purok consumption history is available for this analysis.
        </p>
      )}
    </div>
  );
}

function RecommendationCard({ area, result }) {
  const items = result?.recommendations ?? [];
  const recommendation = items[0];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="font-bold text-slate-900">{area}</h4>
      <div className="mt-4">
        {recommendation ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <h5 className="text-sm font-bold text-emerald-900">
              {recommendation.title || "Recommended action"}
            </h5>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              {recommendation.description}
            </p>
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
            {result?.summary ?? "No recommendations are available."}
          </p>
        )}
      </div>
    </article>
  );
}

function RecommendationGroup({ items, title }) {
  return (
    <div>
      <h3 className="mb-3 font-bold text-slate-900">{title}</h3>
      {items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <RecommendationCard
              area={item.purok}
              key={item.purok}
              result={item}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          No purok consumption history is available for recommendations.
        </p>
      )}
    </div>
  );
}

export default function AnomalyRecommendationSection() {
  const [analysis, setAnalysis] = useState(EMPTY_ANALYSIS);
  const [recommendations, setRecommendations] = useState(
    EMPTY_RECOMMENDATIONS,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAnalysis = useCallback(async (signal) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [anomalyResponse, recommendationResponse] = await Promise.all([
        generateAllAnomalies({ signal }),
        fetchAllRecommendations({ signal }),
      ]);
      setAnalysis({ ...EMPTY_ANALYSIS, ...(anomalyResponse?.data ?? {}) });
      setRecommendations({
        ...EMPTY_RECOMMENDATIONS,
        ...(recommendationResponse?.data ?? {}),
      });
    } catch (error) {
      if (!isCanceledRequest(error)) {
        setAnalysis(EMPTY_ANALYSIS);
        setRecommendations(EMPTY_RECOMMENDATIONS);
        setErrorMessage(
          error.response?.data?.message ??
            "Unable to load Gemini anomaly analysis and recommendations.",
        );
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        loadAnalysis(controller.signal);
      }
    });
    return () => controller.abort();
  }, [loadAnalysis]);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      data-testid="anomaly-recommendation-section"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-water-600">
            Gemini AI Decision Support
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Consumption Intelligence
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Detects unusual usage and provides data-based administrative actions.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={loading}
          onClick={() => loadAnalysis()}
          type="button"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh analysis
        </button>
      </div>

      {loading && (
        <LoadingSkeleton count={3} label="Analyzing consumption history" variant="list" />
      )}

      {!loading && errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!loading && !errorMessage && (
        <div className="space-y-7">
          <div className="grid gap-4 lg:grid-cols-2">
            <AnomalyAlertCard
              anomalies={analysis.overallMonthly?.anomalies}
              area="Overall Monthly"
              message={analysis.overallMonthly?.summary}
              riskScore={analysis.overallMonthly?.riskScore}
              severity={analysis.overallMonthly?.status}
            />
            <AnomalyAlertCard
              anomalies={analysis.overallYearly?.anomalies}
              area="Overall Yearly"
              message={analysis.overallYearly?.summary}
              riskScore={analysis.overallYearly?.riskScore}
              severity={analysis.overallYearly?.status}
            />
          </div>

          <AnomalyGroup
            items={analysis.allPuroksMonthly}
            title="Monthly anomaly status per purok"
          />
          <AnomalyGroup
            items={analysis.allPuroksYearly}
            title="Yearly anomaly status per purok"
          />

          <div className="border-t border-slate-200 pt-7">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <Lightbulb className="h-5 w-5 text-emerald-600" />
              AI Recommendations
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Practical actions generated from the recorded consumption trends.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RecommendationCard
              area="Overall Monthly"
              result={recommendations.overallMonthly}
            />
            <RecommendationCard
              area="Overall Yearly"
              result={recommendations.overallYearly}
            />
          </div>

          <RecommendationGroup
            items={recommendations.allPuroksMonthly}
            title="Monthly recommendations per purok"
          />
          <RecommendationGroup
            items={recommendations.allPuroksYearly}
            title="Yearly recommendations per purok"
          />
        </div>
      )}
    </section>
  );
}
