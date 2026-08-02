import { AlertCircle, RefreshCw } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";

export default function AnalyticsMetricCard({
  description,
  error,
  icon: Icon,
  label,
  loading,
  onRefresh,
  testId,
  tone = "light",
  unit = "m³",
  value,
}) {
  const dark = tone === "dark";

  return (
    <article
      className={`flex min-h-52 flex-col rounded-2xl border p-5 shadow-card ${
        dark
          ? "border-navy-950 bg-navy-950 text-white"
          : "border-slate-200 bg-white text-navy-900"
      }`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            dark ? "bg-water-900 text-water-200" : "bg-water-100 text-water-700"
          }`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <button
          aria-label={`Refresh ${label.toLowerCase()}`}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-600 focus-visible:ring-offset-2 disabled:opacity-50 ${
            dark
              ? "border-slate-700 bg-navy-900 text-slate-300 hover:border-water-500 hover:text-white focus-visible:ring-offset-navy-950"
              : "border-slate-200 bg-white text-slate-500 hover:border-water-300 hover:bg-water-50 hover:text-water-700"
          }`}
          disabled={loading}
          onClick={onRefresh}
          title={`Refresh ${label.toLowerCase()}`}
          type="button"
        >
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p
        className={`mt-4 text-xs font-bold uppercase tracking-[0.14em] ${
          dark ? "text-water-200" : "text-water-700"
        }`}
      >
        {label}
      </p>

      {loading ? (
        <LoadingSkeleton
          className={`mt-3 ${dark ? "opacity-30" : ""}`}
          label={`Loading ${label.toLowerCase()}`}
          variant="inline"
        />
      ) : error ? (
        <div className={`mt-3 flex flex-1 flex-col items-start gap-3 text-sm ${dark ? "text-red-200" : "text-red-700"}`} role="alert">
          <span className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="leading-5">{error}</span>
          </span>
          <button
            className={`min-h-11 rounded-xl px-3 text-sm font-bold ${
              dark ? "bg-white/10 text-white hover:bg-white/15" : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
            onClick={onRefresh}
            type="button"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-mono text-3xl font-extrabold tabular-nums tracking-tight">
              {value}
            </span>
            <span className={`font-mono text-sm font-bold ${dark ? "text-slate-300" : "text-slate-500"}`}>
              {unit}
            </span>
          </div>
          <p className={`mt-2 text-sm leading-5 ${dark ? "text-slate-300" : "text-slate-500"}`}>
            {description}
          </p>
        </div>
      )}
    </article>
  );
}
