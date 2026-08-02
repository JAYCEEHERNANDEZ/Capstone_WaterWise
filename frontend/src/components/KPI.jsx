import { MoreHorizontal, Minus, TrendingDown, TrendingUp } from "lucide-react";

const trendStyles = {
  positive: "bg-emerald-50 text-emerald-700",
  negative: "bg-red-50 text-red-700",
  neutral: "bg-slate-100 text-slate-600",
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

/** A uniform metric card for new page summaries. Existing KPI components stay independent. */
export default function KPI({
  title,
  value,
  unit,
  icon: Icon,
  description,
  trend,
  trendDirection = "neutral",
  trendTone = "neutral",
  menuLabel,
  onMenu,
  className = "",
}) {
  const TrendIcon = trendIcons[trendDirection] ?? Minus;

  return (
    <article
      className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-card ${className}`.trim()}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-water-50 text-water-700">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        ) : null}
        <h2 className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700 sm:text-base">
          {title}
        </h2>
        {onMenu ? (
          <button
            aria-label={menuLabel ?? `More options for ${title}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-water-500 focus-visible:ring-offset-2"
            onClick={onMenu}
            type="button"
          >
            <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <p className="mt-5 font-mono text-3xl font-extrabold tracking-tight text-navy-900 tabular-nums">
        {value}
        {unit ? <span className="ml-1.5 text-sm font-bold text-slate-500">{unit}</span> : null}
      </p>

      {trend ? (
        <div className="mt-3 flex min-w-0 items-center gap-2 text-xs">
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 font-bold ${trendStyles[trendTone] ?? trendStyles.neutral}`}
          >
            <TrendIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {trend}
          </span>
          {description ? <span className="truncate text-slate-500">{description}</span> : null}
        </div>
      ) : description ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
      ) : null}
    </article>
  );
}
